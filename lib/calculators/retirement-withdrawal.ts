// Pure logic for the Retirement Withdrawal Calculator.
// Simulates a retirement portfolio year by year: the balance earns a return,
// then a withdrawal is taken. Withdrawals can grow each year with inflation so
// spending power stays roughly constant. Exposes a per-year schedule for
// charting and reports how long the money lasts.

export type WithdrawalTiming = "begin" | "end";

export interface RetirementWithdrawalInput {
  startingBalance: number;
  annualWithdrawal: number;
  annualReturnPct: number;
  inflationPct: number;
  years: number;
  timing: WithdrawalTiming;
}

export interface RetirementYearPoint {
  year: number;
  startBalance: number;
  withdrawal: number;
  growth: number;
  endBalance: number;
}

export interface RetirementWithdrawalResult {
  endingBalance: number;
  totalWithdrawn: number;
  totalGrowth: number;
  yearsLasted: number; // full years money lasted before running out (or full horizon)
  depleted: boolean; // true if the balance hit zero before the horizon ended
  firstYearWithdrawalRatePct: number; // first withdrawal as % of starting balance
  schedule: RetirementYearPoint[];
}

export function computeRetirementWithdrawal(
  input: RetirementWithdrawalInput
): RetirementWithdrawalResult | null {
  const {
    startingBalance,
    annualWithdrawal,
    annualReturnPct,
    inflationPct,
    years,
    timing,
  } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (startingBalance < 0 || annualWithdrawal < 0) return null;
  if (!Number.isFinite(annualReturnPct) || !Number.isFinite(inflationPct)) return null;

  const r = annualReturnPct / 100;
  const infl = inflationPct / 100;
  const totalYears = Math.round(years);

  let balance = startingBalance;
  let totalWithdrawn = 0;
  let totalGrowth = 0;
  let yearsLasted = 0;
  let depleted = false;

  const schedule: RetirementYearPoint[] = [
    { year: 0, startBalance: startingBalance, withdrawal: 0, growth: 0, endBalance: startingBalance },
  ];

  for (let y = 1; y <= totalYears; y++) {
    const startBalance = balance;
    // Withdrawal grows with inflation each year after the first.
    const wanted = annualWithdrawal * Math.pow(1 + infl, y - 1);

    let withdrawal = 0;
    let growth = 0;

    if (timing === "begin") {
      // Take the withdrawal first (capped at available cash), then grow the rest.
      withdrawal = Math.min(wanted, balance);
      balance -= withdrawal;
      growth = balance * r;
      balance += growth;
    } else {
      // Grow for the year, then take the withdrawal at year end.
      growth = balance * r;
      balance += growth;
      withdrawal = Math.min(wanted, balance);
      balance -= withdrawal;
    }

    if (balance < 0) balance = 0;

    totalWithdrawn += withdrawal;
    totalGrowth += growth;

    schedule.push({
      year: y,
      startBalance,
      withdrawal,
      growth,
      endBalance: balance,
    });

    if (!depleted) {
      // Money "lasted" this year if the requested withdrawal was fully covered.
      if (withdrawal >= wanted - 1e-6) {
        yearsLasted = y;
      } else {
        depleted = true;
      }
    }
  }

  const firstYearWithdrawalRatePct =
    startingBalance > 0 ? (annualWithdrawal / startingBalance) * 100 : 0;

  return {
    endingBalance: balance,
    totalWithdrawn,
    totalGrowth,
    yearsLasted,
    depleted,
    firstYearWithdrawalRatePct,
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
