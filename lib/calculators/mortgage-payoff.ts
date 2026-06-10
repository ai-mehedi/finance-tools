// Pure logic for the Mortgage Payoff Calculator.
// Compares a standard amortizing mortgage against the same loan with an extra
// monthly payment applied to principal. Reports the time saved, the interest
// saved, and exposes a per-year balance schedule for both scenarios.

export interface MortgagePayoffInput {
  balance: number; // current principal owed
  annualRatePct: number; // nominal annual interest rate
  termYears: number; // remaining term in years
  extraMonthly: number; // additional principal paid each month
}

export interface PayoffYearPoint {
  year: number;
  baseBalance: number; // balance with no extra payments
  acceleratedBalance: number; // balance with extra payments
}

export interface MortgagePayoffResult {
  monthlyPayment: number; // scheduled principal + interest payment
  baseMonths: number; // payoff time without extra payments
  acceleratedMonths: number; // payoff time with extra payments
  monthsSaved: number;
  baseTotalInterest: number;
  acceleratedTotalInterest: number;
  interestSaved: number;
  payoffDateLabel: string; // e.g. "8 years, 4 months"
  schedule: PayoffYearPoint[];
}

function monthsLabel(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} year${y === 1 ? "" : "s"}`);
  if (m > 0) parts.push(`${m} month${m === 1 ? "" : "s"}`);
  if (parts.length === 0) return "0 months";
  return parts.join(", ");
}

// Amortize a loan to payoff, returning months taken and total interest paid,
// plus an optional sampler of the balance at the end of each whole year.
function amortize(
  balance: number,
  monthlyRate: number,
  payment: number,
  sampleYears: number,
): { months: number; totalInterest: number; yearly: number[] } {
  let bal = balance;
  let totalInterest = 0;
  let months = 0;
  const yearly: number[] = [balance];
  const cap = 12 * 100; // hard ceiling to avoid runaway loops

  while (bal > 0.005 && months < cap) {
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal <= 0) {
      // Payment does not cover interest; loan never amortizes.
      return { months: Infinity, totalInterest: Infinity, yearly };
    }
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
    months++;
    if (months % 12 === 0) yearly.push(Math.max(bal, 0));
  }

  // Pad the yearly sampler so both scenarios cover the same horizon.
  while (yearly.length <= sampleYears) yearly.push(0);

  return { months, totalInterest, yearly };
}

export function computeMortgagePayoff(input: MortgagePayoffInput): MortgagePayoffResult | null {
  const { balance, annualRatePct, termYears, extraMonthly } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(extraMonthly) || extraMonthly < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  // Scheduled monthly payment for the original term.
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = balance / n;
  } else {
    const f = Math.pow(1 + monthlyRate, n);
    monthlyPayment = (balance * monthlyRate * f) / (f - 1);
  }

  const sampleYears = Math.ceil(termYears);

  const base = amortize(balance, monthlyRate, monthlyPayment, sampleYears);
  const accel = amortize(balance, monthlyRate, monthlyPayment + extraMonthly, sampleYears);

  const horizon = Math.max(base.yearly.length, accel.yearly.length);
  const schedule: PayoffYearPoint[] = [];
  for (let i = 0; i < horizon; i++) {
    schedule.push({
      year: i,
      baseBalance: i < base.yearly.length ? base.yearly[i] : 0,
      acceleratedBalance: i < accel.yearly.length ? accel.yearly[i] : 0,
    });
  }

  const monthsSaved = Number.isFinite(accel.months)
    ? Math.max(base.months - accel.months, 0)
    : 0;
  const interestSaved = Number.isFinite(accel.totalInterest)
    ? Math.max(base.totalInterest - accel.totalInterest, 0)
    : 0;

  return {
    monthlyPayment,
    baseMonths: base.months,
    acceleratedMonths: accel.months,
    monthsSaved,
    baseTotalInterest: base.totalInterest,
    acceleratedTotalInterest: accel.totalInterest,
    interestSaved,
    payoffDateLabel: monthsLabel(accel.months),
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

export { monthsLabel };
