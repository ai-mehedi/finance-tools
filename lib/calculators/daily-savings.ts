// Pure logic for the Daily Savings Calculator.
// Models putting a fixed amount aside every day. Interest compounds daily on
// the running balance, and a per-year schedule is exposed for charting the
// balance against the plain total of deposits.

export interface DailySavingsInput {
  dailyAmount: number;
  annualRatePct: number;
  years: number;
  startingBalance: number;
}

export interface DailySavingsPoint {
  year: number;
  balance: number;
  deposited: number; // starting balance + all deposits so far
  interest: number; // balance minus deposited
}

export interface DailySavingsResult {
  futureValue: number;
  totalDeposited: number; // deposits only, excludes the starting balance
  totalInterest: number;
  schedule: DailySavingsPoint[];
}

export function computeDailySavings(input: DailySavingsInput): DailySavingsResult | null {
  const { dailyAmount, annualRatePct, years, startingBalance } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (dailyAmount < 0 || annualRatePct < 0 || startingBalance < 0) return null;
  if (!Number.isFinite(dailyAmount) || !Number.isFinite(annualRatePct) || !Number.isFinite(startingBalance)) {
    return null;
  }

  const dailyRate = annualRatePct / 100 / 365;
  const totalDays = Math.round(years * 365);

  let balance = startingBalance;
  const schedule: DailySavingsPoint[] = [
    { year: 0, balance: startingBalance, deposited: startingBalance, interest: 0 },
  ];

  for (let d = 1; d <= totalDays; d++) {
    balance = balance * (1 + dailyRate) + dailyAmount;
    if (d % 365 === 0 || d === totalDays) {
      const deposited = startingBalance + dailyAmount * d;
      schedule.push({
        year: d / 365,
        balance,
        deposited,
        interest: balance - deposited,
      });
    }
  }

  const totalDeposited = dailyAmount * totalDays;
  const futureValue = balance;
  const totalInterest = futureValue - startingBalance - totalDeposited;

  return { futureValue, totalDeposited, totalInterest, schedule };
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
