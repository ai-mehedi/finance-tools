// Pure logic for the 52 Week Savings Calculator.
// In the classic challenge you save a growing amount each week: a base amount in
// week 1, base + step in week 2, and so on for 52 weeks. This builds the weekly
// schedule and the cumulative total, with a per-week schedule for charting.

export interface Week52SavingsInput {
  startAmount: number; // amount saved in week 1
  weeklyIncrease: number; // added each week (the "step")
  weeks: number; // number of weeks to run (defaults to 52)
}

export interface WeekPoint {
  week: number;
  deposit: number; // amount saved that week
  total: number; // cumulative saved through this week
}

export interface Week52SavingsResult {
  total: number; // total saved over the run
  finalWeekDeposit: number; // amount saved in the last week
  averageWeekly: number;
  weeks: number;
  schedule: WeekPoint[]; // one point per week, starting at week 0 = 0
}

export function computeWeek52Savings(input: Week52SavingsInput): Week52SavingsResult | null {
  const { startAmount, weeklyIncrease } = input;
  const weeks = Math.round(input.weeks);

  if (!Number.isFinite(weeks) || weeks <= 0) return null;
  if (startAmount < 0 || weeklyIncrease < 0) return null;
  if (!Number.isFinite(startAmount) || !Number.isFinite(weeklyIncrease)) return null;

  let running = 0;
  let finalWeekDeposit = 0;
  const schedule: WeekPoint[] = [{ week: 0, deposit: 0, total: 0 }];

  for (let w = 1; w <= weeks; w++) {
    const deposit = startAmount + weeklyIncrease * (w - 1);
    running += deposit;
    finalWeekDeposit = deposit;
    schedule.push({ week: w, deposit, total: running });
  }

  return {
    total: running,
    finalWeekDeposit,
    averageWeekly: running / weeks,
    weeks,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
