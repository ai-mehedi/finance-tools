// Pure logic for the Future Value Calculator.
// Combines the future value of a present lump sum with the future value of a
// recurring contribution (an ordinary annuity, contribution at period end).
// Simulates month by month so any compounding choice stays consistent, and
// exposes a per-year schedule for charting.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const FREQ_PER_YEAR: Record<Frequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface FutureValueInput {
  presentValue: number;
  monthlyContribution: number;
  annualRatePct: number;
  years: number;
  frequency: Frequency;
}

export interface FutureValueYearPoint {
  year: number;
  balance: number;
  contributed: number; // present value plus contributions made so far
  interest: number; // balance minus contributed
}

export interface FutureValueResult {
  futureValue: number;
  totalContributions: number; // excludes the starting present value
  totalInterest: number;
  schedule: FutureValueYearPoint[];
}

export function computeFutureValue(input: FutureValueInput): FutureValueResult | null {
  const { presentValue, monthlyContribution, annualRatePct, years, frequency } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (presentValue < 0 || monthlyContribution < 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;

  const n = FREQ_PER_YEAR[frequency];
  const r = annualRatePct / 100;
  // Effective monthly rate equivalent to the nominal annual rate compounded n times/year.
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  const months = Math.round(years * 12);
  let balance = presentValue;

  const schedule: FutureValueYearPoint[] = [
    { year: 0, balance: presentValue, contributed: presentValue, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (m % 12 === 0) {
      const contributed = presentValue + monthlyContribution * m;
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
  const totalInterest = futureValue - presentValue - totalContributions;

  return { futureValue, totalContributions, totalInterest, schedule };
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
