// Pure logic for the Car Depreciation Calculator.
// Models value loss with a constant annual depreciation rate (declining balance),
// which closely matches how vehicles actually lose value: fast early, slower later.
// Exposes a per-year schedule for charting the value curve.

export interface CarDepreciationInput {
  purchasePrice: number;
  annualRatePct: number; // percent of remaining value lost each year
  years: number;
}

export interface CarDepreciationYearPoint {
  year: number;
  value: number; // remaining value at end of year
  lost: number; // cumulative value lost
}

export interface CarDepreciationResult {
  finalValue: number;
  totalDepreciation: number;
  firstYearLoss: number;
  averageAnnualLoss: number;
  schedule: CarDepreciationYearPoint[]; // one point per year, starting at year 0
}

export function computeCarDepreciation(
  input: CarDepreciationInput
): CarDepreciationResult | null {
  const { purchasePrice, annualRatePct, years } = input;

  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (annualRatePct < 0 || annualRatePct > 100) return null;

  const rate = annualRatePct / 100;
  const n = Math.round(years);

  let value = purchasePrice;
  const schedule: CarDepreciationYearPoint[] = [
    { year: 0, value: purchasePrice, lost: 0 },
  ];

  let firstYearLoss = 0;
  for (let yr = 1; yr <= n; yr++) {
    const loss = value * rate;
    if (yr === 1) firstYearLoss = loss;
    value = value - loss;
    schedule.push({ year: yr, value, lost: purchasePrice - value });
  }

  const finalValue = value;
  const totalDepreciation = purchasePrice - finalValue;
  const averageAnnualLoss = totalDepreciation / n;

  return {
    finalValue,
    totalDepreciation,
    firstYearLoss,
    averageAnnualLoss,
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
