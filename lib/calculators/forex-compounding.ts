// Pure logic for the Forex Compounding Calculator.
// Models a trading account that grows by a fixed percentage gain per period
// (e.g. per day, week or month), reinvesting profits so each period's gain is
// applied to the larger balance. Optionally a flat amount is added each period
// to simulate ongoing deposits. Exposes a per-period schedule for charting.

export type Period = "daily" | "weekly" | "monthly";

export const PERIODS_PER_YEAR: Record<Period, number> = {
  daily: 252, // trading days
  weekly: 52,
  monthly: 12,
};

export interface ForexCompoundingInput {
  startingBalance: number;
  gainPerPeriodPct: number; // percent return each period
  periods: number; // how many periods to compound
  period: Period;
  depositPerPeriod: number; // optional flat top-up each period
}

export interface ForexPeriodPoint {
  period: number;
  balance: number;
  deposited: number; // starting balance plus deposits made so far
  profit: number; // balance minus deposited
}

export interface ForexCompoundingResult {
  endingBalance: number;
  totalProfit: number;
  totalDeposited: number; // starting balance plus all deposits
  totalReturnPct: number; // profit divided by total deposited
  perPeriodProfitFirst: number; // gain in the very first period
  schedule: ForexPeriodPoint[];
}

export function computeForexCompounding(
  input: ForexCompoundingInput
): ForexCompoundingResult | null {
  const { startingBalance, gainPerPeriodPct, periods, period, depositPerPeriod } = input;

  if (!Number.isFinite(periods) || periods <= 0) return null;
  if (!Number.isFinite(startingBalance) || startingBalance <= 0) return null;
  if (!Number.isFinite(gainPerPeriodPct)) return null;
  if (!Number.isFinite(depositPerPeriod) || depositPerPeriod < 0) return null;

  const totalPeriods = Math.round(periods);
  const g = gainPerPeriodPct / 100;

  let balance = startingBalance;
  const perPeriodProfitFirst = balance * g;

  // Keep chart point count reasonable for very long horizons.
  const step = Math.max(1, Math.ceil(totalPeriods / 120));

  const schedule: ForexPeriodPoint[] = [
    { period: 0, balance: startingBalance, deposited: startingBalance, profit: 0 },
  ];

  for (let p = 1; p <= totalPeriods; p++) {
    // Apply the percentage gain, then add the flat deposit for the period.
    balance = balance * (1 + g) + depositPerPeriod;
    if (p % step === 0 || p === totalPeriods) {
      const deposited = startingBalance + depositPerPeriod * p;
      schedule.push({
        period: p,
        balance,
        deposited,
        profit: balance - deposited,
      });
    }
  }

  const totalDeposited = startingBalance + depositPerPeriod * totalPeriods;
  const endingBalance = balance;
  const totalProfit = endingBalance - totalDeposited;
  const totalReturnPct = totalDeposited > 0 ? (totalProfit / totalDeposited) * 100 : 0;

  return {
    endingBalance,
    totalProfit,
    totalDeposited,
    totalReturnPct,
    perPeriodProfitFirst,
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
