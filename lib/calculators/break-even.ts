// Pure logic for the Break Even Calculator.
// Finds the sales volume where total revenue equals total cost using
// the contribution margin: break-even units = fixed costs / (price - variable cost).
// Also builds a small revenue-vs-cost schedule for charting the break-even point.

export interface BreakEvenInput {
  fixedCosts: number; // total fixed costs over the period
  pricePerUnit: number; // selling price per unit
  variableCostPerUnit: number; // variable cost per unit
}

export interface BreakEvenPoint {
  units: number;
  revenue: number;
  totalCost: number;
}

export interface BreakEvenResult {
  contributionMargin: number; // price minus variable cost, per unit
  contributionMarginPct: number; // margin as a percent of price
  breakEvenUnits: number;
  breakEvenRevenue: number; // sales dollars at break-even
  schedule: BreakEvenPoint[];
}

export function computeBreakEven(input: BreakEvenInput): BreakEvenResult | null {
  const { fixedCosts, pricePerUnit, variableCostPerUnit } = input;

  if (!Number.isFinite(fixedCosts) || fixedCosts < 0) return null;
  if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) return null;
  if (!Number.isFinite(variableCostPerUnit) || variableCostPerUnit < 0) return null;

  const contributionMargin = pricePerUnit - variableCostPerUnit;
  // If each unit does not cover its own variable cost, break-even is impossible.
  if (contributionMargin <= 0) return null;

  const contributionMarginPct = (contributionMargin / pricePerUnit) * 100;
  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  // Sample from 0 to twice the break-even point so the crossover sits mid-chart.
  const maxUnits = Math.max(breakEvenUnits * 2, 1);
  const steps = 20;
  const schedule: BreakEvenPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const units = (maxUnits / steps) * i;
    schedule.push({
      units,
      revenue: units * pricePerUnit,
      totalCost: fixedCosts + units * variableCostPerUnit,
    });
  }

  return {
    contributionMargin,
    contributionMarginPct,
    breakEvenUnits,
    breakEvenRevenue,
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

export const formatUnits = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? Math.ceil(n) : 0,
  );
