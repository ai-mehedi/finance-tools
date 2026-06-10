// Pure logic for the Rent Increase Calculator.
// Applies a percentage (or fixed-dollar) increase to a current rent and projects
// the new rent forward over several years assuming the same annual increase,
// exposing a per-year schedule for charting.

export type IncreaseMode = "percent" | "fixed";

export interface RentIncreaseInput {
  currentRent: number; // current monthly rent
  increase: number; // percent (e.g. 5 = 5%) or fixed dollar amount, per the mode
  mode: IncreaseMode;
  years: number; // how many years to project forward (>= 1)
}

export interface RentIncreaseYearPoint {
  year: number; // 0 = today
  monthlyRent: number;
  annualRent: number;
}

export interface RentIncreaseResult {
  newMonthlyRent: number; // rent after the first increase
  monthlyDifference: number; // dollars more per month after first increase
  annualDifference: number; // extra dollars paid over a full year
  effectivePercent: number; // the first-year increase expressed as a percent
  projectedRent: number; // monthly rent after the full projection horizon
  schedule: RentIncreaseYearPoint[];
}

export function computeRentIncrease(input: RentIncreaseInput): RentIncreaseResult | null {
  const { currentRent, increase, mode, years } = input;

  if (!Number.isFinite(currentRent) || currentRent <= 0) return null;
  if (!Number.isFinite(increase) || increase < 0) return null;
  if (!Number.isFinite(years) || years < 1) return null;

  const horizon = Math.round(years);

  const applyOnce = (rent: number): number =>
    mode === "percent" ? rent * (1 + increase / 100) : rent + increase;

  const newMonthlyRent = applyOnce(currentRent);
  const monthlyDifference = newMonthlyRent - currentRent;
  const annualDifference = monthlyDifference * 12;
  const effectivePercent = currentRent > 0 ? (monthlyDifference / currentRent) * 100 : 0;

  const schedule: RentIncreaseYearPoint[] = [
    { year: 0, monthlyRent: currentRent, annualRent: currentRent * 12 },
  ];

  let rent = currentRent;
  for (let y = 1; y <= horizon; y++) {
    rent = applyOnce(rent);
    schedule.push({ year: y, monthlyRent: rent, annualRent: rent * 12 });
  }

  const projectedRent = rent;

  return {
    newMonthlyRent,
    monthlyDifference,
    annualDifference,
    effectivePercent,
    projectedRent,
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
