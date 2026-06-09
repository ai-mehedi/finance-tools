// Pure logic for the Compound Interest Calculator.
// Simulates month-by-month growth so monthly contributions and any
// compounding frequency combine correctly, and exposes a per-year schedule
// for charting.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const FREQ_PER_YEAR: Record<Frequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface CompoundInput {
  principal: number;
  monthlyContribution: number;
  annualRatePct: number;
  years: number;
  frequency: Frequency;
}

export interface YearPoint {
  year: number;
  balance: number;
  /** Principal + all contributions made so far (the money you put in). */
  contributed: number;
  /** Balance minus contributed = interest earned so far. */
  interest: number;
}

export interface CompoundResult {
  futureValue: number;
  totalContributions: number; // excludes the starting principal
  totalInterest: number;
  schedule: YearPoint[]; // one point per year, starting at year 0
}

export function computeCompoundInterest(input: CompoundInput): CompoundResult | null {
  const { principal, monthlyContribution, annualRatePct, years, frequency } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (principal < 0 || annualRatePct < 0 || monthlyContribution < 0) return null;

  const n = FREQ_PER_YEAR[frequency];
  const r = annualRatePct / 100;
  // Effective monthly rate equivalent to the nominal annual rate compounded n times/year.
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  const months = Math.round(years * 12);
  let balance = principal;

  const schedule: YearPoint[] = [
    { year: 0, balance: principal, contributed: principal, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (m % 12 === 0) {
      const contributed = principal + monthlyContribution * m;
      schedule.push({
        year: m / 12,
        balance,
        contributed,
        interest: balance - contributed,
      });
    }
  }

  const totalContributions = monthlyContribution * months;
  const futureValue = balance;
  const totalInterest = futureValue - principal - totalContributions;

  return { futureValue, totalContributions, totalInterest, schedule };
}

// Fixed en-US locale so server and client render identical strings (no hydration mismatch).
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUSD(n: number): string {
  return usd.format(Number.isFinite(n) ? n : 0);
}

/** Compact axis labels like $1.2k / $3.4M. */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
