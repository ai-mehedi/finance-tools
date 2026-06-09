// Pure logic for the CAGR (Compound Annual Growth Rate) Calculator.
// CAGR is the constant yearly rate that grows the beginning value into the
// ending value over the given number of years:
//   CAGR = (endValue / beginValue)^(1 / years) - 1   (returned as a percentage)
// It is a single summary figure, so there is no schedule or chart.

export interface CagrInput {
  beginValue: number;
  endValue: number;
  years: number;
}

export interface CagrResult {
  /** Compound annual growth rate, as a percentage (e.g. 8.5 means 8.5%). */
  cagrPct: number;
  /** Total growth over the whole period, as a percentage. */
  totalGrowthPct: number;
  /** Absolute gain in value (endValue - beginValue). */
  absoluteGain: number;
}

export function computeCagr(input: CagrInput): CagrResult | null {
  const { beginValue, endValue, years } = input;

  if (!Number.isFinite(beginValue) || beginValue <= 0) return null;
  if (!Number.isFinite(endValue) || endValue < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const ratio = endValue / beginValue;
  const cagrPct = (Math.pow(ratio, 1 / years) - 1) * 100;
  const totalGrowthPct = (ratio - 1) * 100;
  const absoluteGain = endValue - beginValue;

  return { cagrPct, totalGrowthPct, absoluteGain };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "0.00%";
  return `${n.toFixed(2)}%`;
}
