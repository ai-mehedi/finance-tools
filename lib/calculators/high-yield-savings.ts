// Pure logic for the High Yield Savings Calculator.
// Grows an opening balance plus regular monthly deposits inside a high-yield
// savings account at a stated APY, compounding monthly, and exposes a per-month
// schedule for charting balance versus money deposited.

export type DepositTiming = "start" | "end";

export interface HighYieldSavingsInput {
  initialDeposit: number;
  monthlyDeposit: number;
  apyPct: number; // annual percentage yield (effective annual rate)
  months: number;
  timing: DepositTiming; // deposit at start or end of each month
}

export interface SavingsMonthPoint {
  month: number;
  balance: number;
  deposited: number; // initial plus deposits so far
  interest: number; // balance minus deposited
}

export interface HighYieldSavingsResult {
  endingBalance: number;
  totalDeposits: number; // excludes the opening deposit
  totalInterest: number;
  effectiveMonthlyRate: number;
  schedule: SavingsMonthPoint[];
}

export function computeHighYieldSavings(
  input: HighYieldSavingsInput
): HighYieldSavingsResult | null {
  const { initialDeposit, monthlyDeposit, apyPct, months, timing } = input;

  if (!Number.isFinite(months) || months <= 0) return null;
  if (initialDeposit < 0 || monthlyDeposit < 0) return null;
  if (!Number.isFinite(apyPct) || apyPct < 0) return null;

  const totalMonths = Math.round(months);
  // APY is the effective annual rate; convert to an equivalent monthly rate.
  const monthlyRate = Math.pow(1 + apyPct / 100, 1 / 12) - 1;

  let balance = initialDeposit;
  const schedule: SavingsMonthPoint[] = [
    { month: 0, balance: initialDeposit, deposited: initialDeposit, interest: 0 },
  ];

  for (let m = 1; m <= totalMonths; m++) {
    if (timing === "start") {
      balance = (balance + monthlyDeposit) * (1 + monthlyRate);
    } else {
      balance = balance * (1 + monthlyRate) + monthlyDeposit;
    }
    const deposited = initialDeposit + monthlyDeposit * m;
    schedule.push({
      month: m,
      balance,
      deposited,
      interest: balance - deposited,
    });
  }

  const totalDeposits = monthlyDeposit * totalMonths;
  const endingBalance = balance;
  const totalInterest = endingBalance - initialDeposit - totalDeposits;

  return {
    endingBalance,
    totalDeposits,
    totalInterest,
    effectiveMonthlyRate: monthlyRate,
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
