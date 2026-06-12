// Pure logic for the Property Tax Estimator.
// Estimates annual property tax from an assessed value and a tax rate, where
// the rate can be entered either as a percentage or in mills (1 mill = $1 of
// tax per $1,000 of assessed value). Supports a homestead/exemption amount
// subtracted from the assessed value before tax, and returns a multi-year
// projection assuming an optional annual value growth rate.

export type RateUnit = "percent" | "mills";

export interface PropertyTaxInput {
  assessedValue: number; // assessed (taxable) value of the property
  exemption: number; // amount deducted before tax (e.g. homestead exemption)
  rate: number; // the tax rate value, interpreted by rateUnit
  rateUnit: RateUnit; // percent of value, or mills per $1,000
  appreciationPct: number; // assumed annual growth in assessed value
  years: number; // projection horizon for the schedule
}

export interface PropertyTaxYearPoint {
  year: number;
  assessed: number; // assessed value that year
  taxable: number; // assessed minus exemption (floored at 0)
  tax: number; // estimated tax that year
  cumulative: number; // total tax paid through that year
}

export interface PropertyTaxResult {
  annualTax: number; // first-year estimated tax
  monthlyTax: number; // annual divided by 12
  effectiveRatePct: number; // tax divided by assessed value, percent
  taxableValue: number; // first-year taxable value
  totalOverHorizon: number; // sum of tax across all projected years
  schedule: PropertyTaxYearPoint[];
}

// Convert any rate input into a plain decimal fraction of assessed value.
function rateToFraction(rate: number, unit: RateUnit): number {
  return unit === "mills" ? rate / 1000 : rate / 100;
}

export function computePropertyTax(input: PropertyTaxInput): PropertyTaxResult | null {
  const { assessedValue, exemption, rate, rateUnit, appreciationPct, years } = input;

  if (!Number.isFinite(assessedValue) || assessedValue <= 0) return null;
  if (!Number.isFinite(rate) || rate < 0) return null;
  if (!Number.isFinite(exemption) || exemption < 0) return null;
  if (!Number.isFinite(appreciationPct)) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const frac = rateToFraction(rate, rateUnit);
  const growth = appreciationPct / 100;
  const horizon = Math.min(Math.round(years), 60);

  const schedule: PropertyTaxYearPoint[] = [];
  let cumulative = 0;

  for (let y = 1; y <= horizon; y++) {
    const assessed = assessedValue * Math.pow(1 + growth, y - 1);
    const taxable = Math.max(assessed - exemption, 0);
    const tax = taxable * frac;
    cumulative += tax;
    schedule.push({ year: y, assessed, taxable, tax, cumulative });
  }

  const first = schedule[0];
  const annualTax = first.tax;
  const monthlyTax = annualTax / 12;
  const effectiveRatePct = (annualTax / assessedValue) * 100;

  return {
    annualTax,
    monthlyTax,
    effectiveRatePct,
    taxableValue: first.taxable,
    totalOverHorizon: cumulative,
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

export const formatPct = (n: number) => `${Number.isFinite(n) ? n.toFixed(2) : "0.00"}%`;
