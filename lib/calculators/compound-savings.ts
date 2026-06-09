// Pure logic for the Compound Savings Calculator.
// Simulates month-by-month growth of a savings balance so that a starting
// deposit, recurring monthly deposits and any compounding frequency combine
// correctly, and exposes a per-year schedule for charting.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const FREQ_PER_YEAR: Record<Frequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface CompoundSavingsInput {
  startingDeposit: number;
  monthlyDeposit: number;
  annualRatePct: number;
  years: number;
  frequency: Frequency;
}

export interface SavingsYearPoint {
  year: number;
  balance: number;
  /** Starting deposit plus all monthly deposits made so far. */
  contributed: number;
  /** Balance minus contributed = interest earned so far. */
  interest: number;
}

export interface CompoundSavingsResult {
  futureValue: number;
  totalDeposits: number; // monthly deposits only, excludes the starting deposit
  totalContributed: number; // starting deposit + monthly deposits
  totalInterest: number;
  schedule: SavingsYearPoint[]; // one point per year, starting at year 0
}

export function computeCompoundSavings(input: CompoundSavingsInput): CompoundSavingsResult | null {
  const { startingDeposit, monthlyDeposit, annualRatePct, years, frequency } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (startingDeposit < 0 || annualRatePct < 0 || monthlyDeposit < 0) return null;

  const n = FREQ_PER_YEAR[frequency];
  const r = annualRatePct / 100;
  // Effective monthly rate equivalent to the nominal annual rate compounded n times/year.
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  const months = Math.round(years * 12);
  let balance = startingDeposit;

  const schedule: SavingsYearPoint[] = [
    { year: 0, balance: startingDeposit, contributed: startingDeposit, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
    if (m % 12 === 0) {
      const contributed = startingDeposit + monthlyDeposit * m;
      schedule.push({
        year: m / 12,
        balance,
        contributed,
        interest: balance - contributed,
      });
    }
  }

  const totalDeposits = monthlyDeposit * months;
  const futureValue = balance;
  const totalContributed = startingDeposit + totalDeposits;
  const totalInterest = futureValue - totalContributed;

  return { futureValue, totalDeposits, totalContributed, totalInterest, schedule };
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
