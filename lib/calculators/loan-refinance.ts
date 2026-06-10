// Pure logic for the Loan Refinance Calculator.
// Compares keeping a current loan against refinancing into a new rate and term,
// accounting for closing costs. Reports the new payment, monthly savings,
// break-even point, and lifetime interest difference. Exposes a cumulative-cost
// schedule for charting where the two paths cross.

export interface LoanRefinanceInput {
  balance: number; // remaining balance on the current loan
  currentRatePct: number;
  remainingYears: number; // years left on the current loan
  newRatePct: number;
  newTermYears: number; // term of the new (refinanced) loan
  closingCosts: number; // up-front cost to refinance
}

export interface LoanRefinanceMonthPoint {
  month: number;
  currentCumulative: number; // cumulative paid keeping the current loan
  refiCumulative: number; // cumulative paid (incl. closing costs) after refi
}

export interface LoanRefinanceResult {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number; // current minus new (positive means refi is cheaper monthly)
  currentTotalInterest: number;
  newTotalInterest: number;
  currentTotalCost: number; // interest + balance over remaining life
  newTotalCost: number; // interest + balance + closing costs
  lifetimeSavings: number; // current total cost minus new total cost
  breakEvenMonths: number | null; // months until cumulative refi cost dips below current; null if never
  schedule: LoanRefinanceMonthPoint[];
}

function paymentFor(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return principal;
  if (monthlyRate === 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

function totalInterest(principal: number, payment: number, months: number): number {
  return payment * months - principal;
}

export function computeLoanRefinance(input: LoanRefinanceInput): LoanRefinanceResult | null {
  const { balance, currentRatePct, remainingYears, newRatePct, newTermYears, closingCosts } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(currentRatePct) || currentRatePct < 0) return null;
  if (!Number.isFinite(remainingYears) || remainingYears <= 0) return null;
  if (!Number.isFinite(newRatePct) || newRatePct < 0) return null;
  if (!Number.isFinite(newTermYears) || newTermYears <= 0) return null;
  if (!Number.isFinite(closingCosts) || closingCosts < 0) return null;

  const curRate = currentRatePct / 100 / 12;
  const newRate = newRatePct / 100 / 12;
  const curMonths = Math.round(remainingYears * 12);
  const newMonths = Math.round(newTermYears * 12);

  const currentPayment = paymentFor(balance, curRate, curMonths);
  const newPayment = paymentFor(balance, newRate, newMonths);

  const currentTotalInterest = totalInterest(balance, currentPayment, curMonths);
  const newTotalInterest = totalInterest(balance, newPayment, newMonths);

  const currentTotalCost = balance + currentTotalInterest;
  const newTotalCost = balance + newTotalInterest + closingCosts;

  // Build cumulative-cost curves. The current loan starts at zero; the refi
  // path starts at the closing costs already spent.
  const span = Math.max(curMonths, newMonths);
  const schedule: LoanRefinanceMonthPoint[] = [
    { month: 0, currentCumulative: 0, refiCumulative: closingCosts },
  ];
  let curCum = 0;
  let refiCum = closingCosts;
  let breakEvenMonths: number | null = null;
  for (let m = 1; m <= span; m++) {
    if (m <= curMonths) curCum += currentPayment;
    if (m <= newMonths) refiCum += newPayment;
    if (breakEvenMonths === null && refiCum <= curCum) breakEvenMonths = m;
    schedule.push({ month: m, currentCumulative: curCum, refiCumulative: refiCum });
  }

  return {
    currentPayment,
    newPayment,
    monthlySavings: currentPayment - newPayment,
    currentTotalInterest,
    newTotalInterest,
    currentTotalCost,
    newTotalCost,
    lifetimeSavings: currentTotalCost - newTotalCost,
    breakEvenMonths,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

export function formatDuration(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0m";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}m`;
  if (m === 0) return `${y}y`;
  return `${y}y ${m}m`;
}
