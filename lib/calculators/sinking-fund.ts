// Pure logic for the Sinking Fund Calculator.
// A sinking fund sets aside a regular deposit so a known target amount is on
// hand by a future date. This solves for the deposit needed (the future-value
// of an ordinary annuity, rearranged for the payment), optionally accounting
// for an interest rate and a starting balance, and exposes a per-period
// schedule of running balances for charting.

export type DepositFrequency = "weekly" | "monthly" | "quarterly" | "annually";

export const DEPOSITS_PER_YEAR: Record<DepositFrequency, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export interface SinkingFundInput {
  goalAmount: number; // target balance to reach
  startingBalance: number; // money already set aside
  years: number; // time horizon
  annualRatePct: number; // annual interest earned on the fund
  frequency: DepositFrequency; // how often a deposit is made
}

export interface SinkingFundPoint {
  period: number; // deposit number
  yearFraction: number; // period expressed in years (for the x axis)
  balance: number; // running balance after this deposit and its interest
  deposited: number; // cumulative deposits plus starting balance
}

export interface SinkingFundResult {
  depositPerPeriod: number;
  totalDeposits: number; // sum of all periodic deposits (excludes starting balance)
  totalInterest: number;
  endingBalance: number;
  periods: number;
  schedule: SinkingFundPoint[];
}

export function computeSinkingFund(input: SinkingFundInput): SinkingFundResult | null {
  const { goalAmount, startingBalance, years, annualRatePct, frequency } = input;

  if (!Number.isFinite(goalAmount) || goalAmount <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (startingBalance < 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;

  const m = DEPOSITS_PER_YEAR[frequency];
  const periods = Math.round(years * m);
  if (periods <= 0) return null;

  const i = annualRatePct / 100 / m; // periodic rate

  // Future value the starting balance grows to on its own.
  const fvStart = startingBalance * Math.pow(1 + i, periods);
  // Amount the deposits must still supply.
  const needed = Math.max(0, goalAmount - fvStart);

  let depositPerPeriod: number;
  if (i === 0) {
    depositPerPeriod = needed / periods;
  } else {
    const annuityFactor = (Math.pow(1 + i, periods) - 1) / i;
    depositPerPeriod = needed / annuityFactor;
  }

  // Simulate to build the schedule and capture rounding-accurate totals.
  let balance = startingBalance;
  let deposited = startingBalance;
  const schedule: SinkingFundPoint[] = [
    { period: 0, yearFraction: 0, balance, deposited },
  ];
  for (let p = 1; p <= periods; p++) {
    balance = balance * (1 + i) + depositPerPeriod;
    deposited += depositPerPeriod;
    schedule.push({ period: p, yearFraction: p / m, balance, deposited });
  }

  const endingBalance = balance;
  const totalDeposits = depositPerPeriod * periods;
  const totalInterest = endingBalance - startingBalance - totalDeposits;

  return {
    depositPerPeriod,
    totalDeposits,
    totalInterest,
    endingBalance,
    periods,
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
