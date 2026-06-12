// Pure logic for the Savings Calculator.
// Projects a savings account balance from a starting deposit plus regular
// monthly deposits earning interest at a chosen compounding frequency.
// Simulates month by month and exposes a per-year schedule for charting.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const FREQ_PER_YEAR: Record<Frequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface SavingsInput {
  initialDeposit: number;
  monthlyDeposit: number;
  apyPct: number; // nominal annual rate, %
  years: number;
  frequency: Frequency;
}

export interface SavingsYearPoint {
  year: number;
  balance: number;
  deposited: number; // initial deposit plus deposits made so far
  interest: number; // balance minus deposited
}

export interface SavingsResult {
  finalBalance: number;
  totalDeposits: number; // excludes the starting deposit
  totalInterest: number;
  schedule: SavingsYearPoint[];
}

export function computeSavings(input: SavingsInput): SavingsResult | null {
  const { initialDeposit, monthlyDeposit, apyPct, years, frequency } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (initialDeposit < 0 || monthlyDeposit < 0) return null;
  if (!Number.isFinite(apyPct)) return null;

  const n = FREQ_PER_YEAR[frequency];
  const r = apyPct / 100;
  // Equivalent monthly rate for a nominal annual rate compounded n times a year.
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  const months = Math.round(years * 12);
  let balance = initialDeposit;

  const schedule: SavingsYearPoint[] = [
    { year: 0, balance: initialDeposit, deposited: initialDeposit, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
    if (m % 12 === 0) {
      const deposited = initialDeposit + monthlyDeposit * m;
      schedule.push({
        year: m / 12,
        balance,
        deposited,
        interest: balance - deposited,
      });
    }
  }

  const totalDeposits = monthlyDeposit * months;
  const finalBalance = balance;
  const totalInterest = finalBalance - initialDeposit - totalDeposits;

  return { finalBalance, totalDeposits, totalInterest, schedule };
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
