// Pure logic for the Retirement Savings Calculator.
// Given a target nest egg, a starting balance and a return, it solves for the
// monthly amount you must save to reach the goal by your retirement date, and
// also projects where your current saving rate would actually land you.
// Exposes a year-by-year accumulation schedule (target path) for charting.

export interface RetirementSavingsInput {
  goalAmount: number; // target nest egg at retirement
  currentSavings: number;
  currentMonthly: number; // what you save now, used to project the gap
  annualReturnPct: number;
  years: number; // years until retirement
}

export interface SavingsYearPoint {
  year: number;
  required: number; // balance on the path that hits the goal exactly
  current: number; // balance if you keep your current monthly amount
}

export interface RetirementSavingsResult {
  requiredMonthly: number; // monthly saving needed to hit the goal
  projectedNestEgg: number; // where the current monthly amount lands you
  shortfall: number; // goal minus projected (positive = behind)
  goalAmount: number;
  totalRequiredContributions: number;
  growthOnRequired: number;
  schedule: SavingsYearPoint[];
}

export function computeRetirementSavings(
  input: RetirementSavingsInput
): RetirementSavingsResult | null {
  const { goalAmount, currentSavings, currentMonthly, annualReturnPct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (goalAmount < 0 || currentSavings < 0 || currentMonthly < 0) return null;
  if (!Number.isFinite(annualReturnPct)) return null;

  const months = Math.round(years * 12);
  const r = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;

  // Future value of the starting balance alone.
  const fvCurrentSavings = currentSavings * Math.pow(1 + r, months);

  // Future value factor of a $1 ordinary monthly contribution.
  const annuityFactor = r === 0 ? months : (Math.pow(1 + r, months) - 1) / r;

  const remaining = goalAmount - fvCurrentSavings;
  let requiredMonthly = remaining <= 0 ? 0 : remaining / annuityFactor;
  if (!Number.isFinite(requiredMonthly) || requiredMonthly < 0) requiredMonthly = 0;

  const projectedNestEgg = fvCurrentSavings + currentMonthly * annuityFactor;
  const shortfall = goalAmount - projectedNestEgg;

  const totalRequiredContributions = requiredMonthly * months;
  const growthOnRequired = goalAmount - currentSavings - totalRequiredContributions;

  // Build yearly schedule for both the required path and the current path.
  const schedule: SavingsYearPoint[] = [
    { year: 0, required: currentSavings, current: currentSavings },
  ];
  let reqBal = currentSavings;
  let curBal = currentSavings;
  for (let m = 1; m <= months; m++) {
    reqBal = reqBal * (1 + r) + requiredMonthly;
    curBal = curBal * (1 + r) + currentMonthly;
    if (m % 12 === 0) {
      schedule.push({ year: m / 12, required: reqBal, current: curBal });
    }
  }

  return {
    requiredMonthly,
    projectedNestEgg,
    shortfall,
    goalAmount,
    totalRequiredContributions,
    growthOnRequired,
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
