// Pure logic for the ROI (Return on Investment) Calculator.
// ROI measures how much an investment gained or lost relative to its cost:
// ROI = (final value minus total cost) divided by total cost. When a holding
// period is supplied, the annualized return (CAGR) is also derived so returns
// over different time spans can be compared on a yearly basis.
//
// A per-year schedule of the compounded value is exposed for charting.

export interface RoiInput {
  initialInvestment: number; // amount invested (cost basis)
  finalValue: number; // value at the end, before subtracting any extra costs
  additionalCosts: number; // fees, commissions or contributions added to the cost
  holdingYears: number; // length of the holding period (may be fractional)
}

export interface RoiYearPoint {
  year: number;
  value: number; // value implied by the annualized return at this year
}

export interface RoiResult {
  netProfit: number; // gain (or loss) in dollars
  totalCost: number; // initial investment plus additional costs
  roiPct: number; // total return over the whole period, as a percent
  annualizedPct: number; // CAGR, as a percent (0 if no holding period)
  multiple: number; // ending value as a multiple of cost (e.g. 1.5x)
  schedule: RoiYearPoint[];
}

export function computeRoi(input: RoiInput): RoiResult | null {
  const { initialInvestment, finalValue, additionalCosts, holdingYears } = input;

  if (!Number.isFinite(initialInvestment) || initialInvestment <= 0) return null;
  if (!Number.isFinite(finalValue) || finalValue < 0) return null;
  if (!Number.isFinite(additionalCosts) || additionalCosts < 0) return null;
  if (!Number.isFinite(holdingYears) || holdingYears < 0) return null;

  const totalCost = initialInvestment + additionalCosts;
  if (totalCost <= 0) return null;

  const netProfit = finalValue - totalCost;
  const roiPct = (netProfit / totalCost) * 100;
  const multiple = finalValue / totalCost;

  // Annualized return (CAGR). Only defined for a positive horizon and a
  // positive ending-to-cost ratio.
  let annualizedPct = 0;
  if (holdingYears > 0 && multiple > 0) {
    annualizedPct = (Math.pow(multiple, 1 / holdingYears) - 1) * 100;
  }

  // Build a smooth year-by-year path using the annualized rate so the chart
  // climbs (or falls) from cost to the final value.
  const schedule: RoiYearPoint[] = [];
  const wholeYears = Math.max(1, Math.min(60, Math.ceil(holdingYears || 1)));
  const ratePerYear = annualizedPct / 100;
  for (let yr = 0; yr <= wholeYears; yr++) {
    const value =
      holdingYears > 0 ? totalCost * Math.pow(1 + ratePerYear, Math.min(yr, holdingYears)) : totalCost;
    schedule.push({ year: yr, value });
  }
  // Pin the last point to the exact final value when a horizon is given.
  if (holdingYears > 0 && schedule.length > 0) {
    schedule[schedule.length - 1] = { year: wholeYears, value: finalValue };
  }

  return { netProfit, totalCost, roiPct, annualizedPct, multiple, schedule };
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
