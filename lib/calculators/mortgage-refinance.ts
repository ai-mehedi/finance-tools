// Pure logic for the Mortgage Refinance Calculator.
// Compares the monthly payment and lifetime interest of an existing mortgage
// against a new (refinanced) loan, factoring in closing costs to find the
// break-even point — the month at which cumulative savings cover those costs.

export interface RefinanceInput {
  currentBalance: number; // remaining principal on the existing loan
  currentRatePct: number; // existing annual interest rate
  currentRemainingYears: number; // years left on the existing loan
  newRatePct: number; // proposed annual interest rate
  newTermYears: number; // term of the new loan
  closingCosts: number; // upfront refinance costs (lender + third party)
}

export interface RefinanceSavingsPoint {
  month: number;
  cumulativeSavings: number; // monthly payment savings minus closing costs
}

export interface RefinanceResult {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number; // positive means the new loan is cheaper per month
  currentTotalInterest: number;
  newTotalInterest: number;
  lifetimeInterestSavings: number;
  breakEvenMonths: number | null; // null if refinance never pays for itself
  schedule: RefinanceSavingsPoint[];
}

// Standard amortizing payment for a fully-amortizing fixed-rate loan.
function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return principal / n;
  const factor = Math.pow(1 + i, n);
  return (principal * i * factor) / (factor - 1);
}

export function computeRefinance(input: RefinanceInput): RefinanceResult | null {
  const {
    currentBalance,
    currentRatePct,
    currentRemainingYears,
    newRatePct,
    newTermYears,
    closingCosts,
  } = input;

  if (!Number.isFinite(currentBalance) || currentBalance <= 0) return null;
  if (!Number.isFinite(currentRemainingYears) || currentRemainingYears <= 0) return null;
  if (!Number.isFinite(newTermYears) || newTermYears <= 0) return null;
  if (currentRatePct < 0 || newRatePct < 0 || closingCosts < 0) return null;

  const currentPayment = monthlyPayment(currentBalance, currentRatePct, currentRemainingYears);
  const newPayment = monthlyPayment(currentBalance, newRatePct, newTermYears);

  const currentMonths = Math.round(currentRemainingYears * 12);
  const newMonths = Math.round(newTermYears * 12);

  const currentTotalInterest = currentPayment * currentMonths - currentBalance;
  const newTotalInterest = newPayment * newMonths - currentBalance;
  const lifetimeInterestSavings = currentTotalInterest - newTotalInterest;

  const monthlySavings = currentPayment - newPayment;

  // Break-even: month where cumulative monthly savings repay the closing costs.
  let breakEvenMonths: number | null = null;
  const schedule: RefinanceSavingsPoint[] = [{ month: 0, cumulativeSavings: -closingCosts }];
  const horizon = Math.max(newMonths, currentMonths);
  for (let m = 1; m <= horizon; m++) {
    const cumulativeSavings = monthlySavings * m - closingCosts;
    if (breakEvenMonths === null && cumulativeSavings >= 0 && monthlySavings > 0) {
      breakEvenMonths = m;
    }
    // Sample roughly yearly to keep the chart light.
    if (m % 12 === 0 || m === horizon) {
      schedule.push({ month: m, cumulativeSavings });
    }
  }

  return {
    currentPayment,
    newPayment,
    monthlySavings,
    currentTotalInterest,
    newTotalInterest,
    lifetimeInterestSavings,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
