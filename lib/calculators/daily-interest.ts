// Pure logic for the Daily Interest Calculator.
// Computes interest that accrues day by day on a balance. Supports either
// daily compounding (interest is added to the balance each day) or simple
// daily accrual (interest is figured on the original principal only), and
// exposes a per-period schedule for charting cumulative interest.

export interface DailyInterestInput {
  principal: number;
  annualRatePct: number;
  days: number;
  compound: boolean; // true = compound daily, false = simple daily accrual
}

export interface DailyInterestPoint {
  day: number;
  balance: number;
  interest: number; // cumulative interest by this day
}

export interface DailyInterestResult {
  dailyRate: number; // decimal rate per day
  firstDayInterest: number;
  totalInterest: number;
  finalBalance: number;
  averageDailyInterest: number;
  schedule: DailyInterestPoint[];
}

export function computeDailyInterest(input: DailyInterestInput): DailyInterestResult | null {
  const { principal, annualRatePct, days, compound } = input;

  if (!Number.isFinite(principal) || principal < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(days) || days <= 0) return null;

  const dailyRate = annualRatePct / 100 / 365;
  const totalDays = Math.round(days);

  // Sample about 60 points across the period so the chart stays light even
  // for long horizons, while always including day 0 and the final day.
  const step = Math.max(1, Math.ceil(totalDays / 60));
  const schedule: DailyInterestPoint[] = [{ day: 0, balance: principal, interest: 0 }];

  let balance = principal;
  let cumInterest = 0;
  let firstDayInterest = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dayInterest = compound ? balance * dailyRate : principal * dailyRate;
    cumInterest += dayInterest;
    balance += dayInterest;
    if (d === 1) firstDayInterest = dayInterest;
    if (d % step === 0 || d === totalDays) {
      schedule.push({ day: d, balance, interest: cumInterest });
    }
  }

  const totalInterest = cumInterest;
  const finalBalance = compound ? balance : principal + cumInterest;
  const averageDailyInterest = totalInterest / totalDays;

  return {
    dailyRate,
    firstDayInterest,
    totalInterest,
    finalBalance,
    averageDailyInterest,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
