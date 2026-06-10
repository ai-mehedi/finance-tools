// Pure logic for the RMD (Required Minimum Distribution) Calculator.
// An RMD is the minimum amount the IRS requires you to withdraw each year
// from a tax-deferred retirement account (Traditional IRA, 401(k), etc.)
// once you reach the required beginning age. The amount equals the prior
// year-end balance divided by a life expectancy factor from the IRS
// Uniform Lifetime Table (the table used by most account owners).
//
// This calculator projects the RMD for the current year and the years that
// follow, growing the balance at an assumed return and subtracting each
// withdrawal, and exposes a per-year schedule for charting.

// IRS Uniform Lifetime Table (effective 2022), distribution period by age.
// Source: IRS Publication 590-B, Appendix B, Table III.
export const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
  107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
};

// Factor used for ages at or beyond the end of the published table.
const FLOOR_FACTOR = 2.0;
const MAX_TABLE_AGE = 120;

export function lifeExpectancyFactor(age: number): number {
  if (age <= 72) return UNIFORM_LIFETIME_TABLE[72];
  if (age >= MAX_TABLE_AGE) return FLOOR_FACTOR;
  return UNIFORM_LIFETIME_TABLE[age] ?? FLOOR_FACTOR;
}

export interface RmdInput {
  age: number; // current age this distribution year
  balance: number; // prior year-end account balance
  annualReturnPct: number; // assumed annual growth on the remaining balance
  projectionYears: number; // how many years to project forward
}

export interface RmdYearPoint {
  year: number; // 0-based offset from the first projected year
  age: number;
  startBalance: number; // balance the RMD is computed against
  factor: number; // life expectancy / distribution period
  rmd: number; // required withdrawal that year
  endBalance: number; // balance after withdrawal and growth
}

export interface RmdResult {
  rmd: number; // this year's required minimum distribution
  factor: number; // this year's distribution period
  percentOfBalance: number; // rmd as a percent of the start balance
  totalWithdrawn: number; // cumulative across the projection
  schedule: RmdYearPoint[];
}

export function computeRmd(input: RmdInput): RmdResult | null {
  const { age, balance, annualReturnPct, projectionYears } = input;

  if (!Number.isFinite(age) || age < 1 || age > 130) return null;
  if (!Number.isFinite(balance) || balance < 0) return null;
  if (!Number.isFinite(annualReturnPct)) return null;
  if (!Number.isFinite(projectionYears) || projectionYears < 1) return null;

  const growth = annualReturnPct / 100;
  const span = Math.min(Math.round(projectionYears), 60);

  let runningBalance = balance;
  const schedule: RmdYearPoint[] = [];
  let totalWithdrawn = 0;

  for (let i = 0; i < span; i++) {
    const currentAge = Math.round(age) + i;
    const factor = lifeExpectancyFactor(currentAge);
    const startBalance = runningBalance;
    const rmd = factor > 0 ? startBalance / factor : startBalance;
    const afterWithdrawal = Math.max(0, startBalance - rmd);
    const endBalance = afterWithdrawal * (1 + growth);

    totalWithdrawn += rmd;
    schedule.push({
      year: i,
      age: currentAge,
      startBalance,
      factor,
      rmd,
      endBalance,
    });

    runningBalance = endBalance;
  }

  const first = schedule[0];
  const percentOfBalance = first.startBalance > 0 ? (first.rmd / first.startBalance) * 100 : 0;

  return {
    rmd: first.rmd,
    factor: first.factor,
    percentOfBalance,
    totalWithdrawn,
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
