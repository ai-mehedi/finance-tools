// Pure logic for the Loan Prepayment Calculator.
// Starts from a loan's original terms to derive its scheduled monthly payment,
// then applies a one-time lump-sum prepayment today and recurring extra
// payments to show the new payoff time and interest saved. Exposes a per-month
// balance schedule for charting.

export interface LoanPrepaymentInput {
  principal: number; // original/current outstanding loan amount
  annualRatePct: number;
  termYears: number; // original term used to set the scheduled payment
  lumpSum: number; // one-off prepayment applied at the start
  extraMonthly: number; // recurring extra payment each month
}

export interface LoanPrepaymentMonthPoint {
  month: number;
  balance: number; // with prepayments
  baselineBalance: number; // original schedule, no prepayments
}

export interface LoanPrepaymentResult {
  scheduledPayment: number; // standard monthly payment for the original term
  originalMonths: number;
  newMonths: number;
  monthsSaved: number;
  originalInterest: number;
  newInterest: number;
  interestSaved: number;
  schedule: LoanPrepaymentMonthPoint[];
}

const MAX_MONTHS = 1200;

// Standard amortizing payment for a principal over a fixed number of months.
function paymentFor(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return principal;
  if (monthlyRate === 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

// Amortizes until cleared, returning months and total interest.
function amortize(principal: number, monthlyRate: number, payment: number): { months: number; interest: number } | null {
  let bal = principal;
  let interest = 0;
  let months = 0;
  while (bal > 0.005 && months < MAX_MONTHS) {
    const i = bal * monthlyRate;
    let p = payment - i;
    if (p <= 0) return null;
    if (p > bal) p = bal;
    bal -= p;
    interest += i;
    months++;
  }
  return { months, interest };
}

export function computeLoanPrepayment(input: LoanPrepaymentInput): LoanPrepaymentResult | null {
  const { principal, annualRatePct, termYears, lumpSum, extraMonthly } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(lumpSum) || lumpSum < 0) return null;
  if (!Number.isFinite(extraMonthly) || extraMonthly < 0) return null;
  if (lumpSum >= principal) return null; // lump sum clears the loan outright

  const monthlyRate = annualRatePct / 100 / 12;
  const totalMonths = Math.round(termYears * 12);
  const scheduledPayment = paymentFor(principal, monthlyRate, totalMonths);

  // Baseline: no prepayments, original schedule.
  const baseline = amortize(principal, monthlyRate, scheduledPayment);
  if (!baseline) return null;

  // With prepayments: apply lump sum up front, keep the same scheduled payment
  // plus the recurring extra each month.
  const startBalance = principal - lumpSum;
  const payment = scheduledPayment + extraMonthly;
  const withPre = amortize(startBalance, monthlyRate, payment);
  if (!withPre) return null;

  const schedule: LoanPrepaymentMonthPoint[] = [
    { month: 0, balance: startBalance, baselineBalance: principal },
  ];
  let bal = startBalance;
  let baseBal = principal;
  const span = Math.max(withPre.months, baseline.months);
  for (let m = 1; m <= span; m++) {
    if (bal > 0.005) {
      const i = bal * monthlyRate;
      let p = payment - i;
      if (p > bal) p = bal;
      bal = Math.max(0, bal - p);
    }
    if (baseBal > 0.005) {
      const i = baseBal * monthlyRate;
      let p = scheduledPayment - i;
      if (p > baseBal) p = baseBal;
      baseBal = Math.max(0, baseBal - p);
    }
    schedule.push({ month: m, balance: bal, baselineBalance: baseBal });
  }

  return {
    scheduledPayment,
    originalMonths: baseline.months,
    newMonths: withPre.months,
    monthsSaved: baseline.months - withPre.months,
    originalInterest: baseline.interest,
    newInterest: withPre.interest,
    interestSaved: baseline.interest - withPre.interest,
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
