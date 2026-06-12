// Pure logic for the Savings Goal Calculator.
// Works backward from a target amount to find the monthly deposit needed to
// reach it within a chosen number of years, given a starting balance and an
// interest rate. Also returns the projected balance schedule for charting.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const FREQ_PER_YEAR: Record<Frequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface SavingsGoalInput {
  goalAmount: number;
  currentSavings: number;
  apyPct: number; // nominal annual rate, %
  years: number;
  frequency: Frequency;
}

export interface SavingsGoalYearPoint {
  year: number;
  balance: number;
  deposited: number; // current savings plus deposits made so far
  interest: number;
}

export interface SavingsGoalResult {
  monthlyDeposit: number; // required deposit each month (can be 0 if already there)
  alreadyReached: boolean; // starting balance alone meets goal
  totalDeposits: number;
  totalInterest: number;
  schedule: SavingsGoalYearPoint[];
}

export function computeSavingsGoal(input: SavingsGoalInput): SavingsGoalResult | null {
  const { goalAmount, currentSavings, apyPct, years, frequency } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(goalAmount) || goalAmount <= 0) return null;
  if (currentSavings < 0) return null;
  if (!Number.isFinite(apyPct)) return null;

  const n = FREQ_PER_YEAR[frequency];
  const r = apyPct / 100;
  const i = Math.pow(1 + r / n, n / 12) - 1; // equivalent monthly rate
  const months = Math.round(years * 12);

  // Future value of the current balance alone after `months`.
  const grownStart = currentSavings * Math.pow(1 + i, months);

  let monthlyDeposit: number;
  let alreadyReached = false;

  if (grownStart >= goalAmount) {
    monthlyDeposit = 0;
    alreadyReached = true;
  } else {
    const remaining = goalAmount - grownStart;
    // FV of an ordinary annuity factor: ((1+i)^m - 1) / i  (deposit at period end).
    const annuityFactor =
      i === 0 ? months : (Math.pow(1 + i, months) - 1) / i;
    monthlyDeposit = remaining / annuityFactor;
  }

  // Build the schedule by simulating month by month with the solved deposit.
  let balance = currentSavings;
  const schedule: SavingsGoalYearPoint[] = [
    { year: 0, balance: currentSavings, deposited: currentSavings, interest: 0 },
  ];
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + i) + monthlyDeposit;
    if (m % 12 === 0) {
      const deposited = currentSavings + monthlyDeposit * m;
      schedule.push({
        year: m / 12,
        balance,
        deposited,
        interest: balance - deposited,
      });
    }
  }

  const totalDeposits = monthlyDeposit * months;
  const totalInterest = balance - currentSavings - totalDeposits;

  return { monthlyDeposit, alreadyReached, totalDeposits, totalInterest, schedule };
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
