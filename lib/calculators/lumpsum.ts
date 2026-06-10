// Pure logic for the Lumpsum Investment Calculator.
// Projects how a one-time investment grows when compounded at an expected
// annual return over a number of years. Compounding is applied yearly and a
// per-year schedule of value versus the original investment is exposed for
// charting. Amounts are formatted in Indian rupees.

export interface LumpsumInput {
  investment: number; // one-time amount invested today
  annualRatePct: number; // expected annual return
  years: number;
}

export interface LumpsumYearPoint {
  year: number;
  value: number; // total value at end of year
  invested: number; // original investment (constant)
  gain: number; // value minus invested
}

export interface LumpsumResult {
  maturityValue: number;
  investedAmount: number;
  estimatedReturns: number;
  absoluteReturnPct: number;
  schedule: LumpsumYearPoint[];
}

export function computeLumpsum(input: LumpsumInput): LumpsumResult | null {
  const { investment, annualRatePct, years } = input;

  if (!Number.isFinite(investment) || investment <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;

  const r = annualRatePct / 100;
  const wholeYears = Math.floor(years);

  const schedule: LumpsumYearPoint[] = [
    { year: 0, value: investment, invested: investment, gain: 0 },
  ];

  for (let y = 1; y <= wholeYears; y++) {
    const value = investment * Math.pow(1 + r, y);
    schedule.push({ year: y, value, invested: investment, gain: value - investment });
  }

  // Final point for any fractional remainder so the headline matches exactly.
  if (years !== wholeYears) {
    const value = investment * Math.pow(1 + r, years);
    schedule.push({ year: years, value, invested: investment, gain: value - investment });
  }

  const maturityValue = investment * Math.pow(1 + r, years);
  const estimatedReturns = maturityValue - investment;
  const absoluteReturnPct = (estimatedReturns / investment) * 100;

  return {
    maturityValue,
    investedAmount: investment,
    estimatedReturns,
    absoluteReturnPct,
    schedule,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
