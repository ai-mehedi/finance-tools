// Pure logic for the Property Tax Calculator.
// Estimates annual and monthly property tax from a home's assessed value,
// applying an assessment ratio, a homestead/exemption reduction and a tax
// rate expressed either as a percentage or in mills. Builds a multi-year
// projection assuming the assessed value grows each year, for charting.

export type RateMode = "percent" | "mills";

export interface PropertyTaxInput {
  marketValue: number; // appraised / market value of the home
  assessmentRatioPct: number; // assessed value as a percent of market value
  exemption: number; // dollar reduction applied to the assessed value
  rate: number; // tax rate, interpreted per rateMode
  rateMode: RateMode; // "percent" => % of taxable value, "mills" => per $1,000
  appreciationPct: number; // annual growth in market value used for projection
  years: number; // projection horizon
}

export interface PropertyTaxYearPoint {
  year: number;
  marketValue: number;
  taxableValue: number;
  annualTax: number;
}

export interface PropertyTaxResult {
  assessedValue: number; // market value times assessment ratio
  taxableValue: number; // assessed value minus exemption (floored at 0)
  effectiveMills: number; // tax expressed in mills regardless of input mode
  effectiveRatePct: number; // annual tax as a percent of market value
  annualTax: number;
  monthlyTax: number;
  schedule: PropertyTaxYearPoint[];
}

// Convert whatever rate the user supplied into a single fraction of taxable value.
function rateAsFraction(rate: number, mode: RateMode): number {
  return mode === "mills" ? rate / 1000 : rate / 100;
}

export function computePropertyTax(input: PropertyTaxInput): PropertyTaxResult | null {
  const {
    marketValue,
    assessmentRatioPct,
    exemption,
    rate,
    rateMode,
    appreciationPct,
    years,
  } = input;

  if (!Number.isFinite(marketValue) || marketValue <= 0) return null;
  if (!Number.isFinite(assessmentRatioPct) || assessmentRatioPct <= 0) return null;
  if (!Number.isFinite(rate) || rate < 0) return null;
  if (exemption < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(appreciationPct)) return null;

  const ratio = assessmentRatioPct / 100;
  const fraction = rateAsFraction(rate, rateMode);
  const growth = appreciationPct / 100;

  const assessedValue = marketValue * ratio;
  const taxableValue = Math.max(0, assessedValue - exemption);
  const annualTax = taxableValue * fraction;
  const monthlyTax = annualTax / 12;

  const effectiveMills = fraction * 1000;
  const effectiveRatePct = marketValue > 0 ? (annualTax / marketValue) * 100 : 0;

  const schedule: PropertyTaxYearPoint[] = [];
  for (let yr = 1; yr <= Math.round(years); yr++) {
    const mv = marketValue * Math.pow(1 + growth, yr - 1);
    const assessed = mv * ratio;
    const taxable = Math.max(0, assessed - exemption);
    schedule.push({
      year: yr,
      marketValue: mv,
      taxableValue: taxable,
      annualTax: taxable * fraction,
    });
  }

  return {
    assessedValue,
    taxableValue,
    effectiveMills,
    effectiveRatePct,
    annualTax,
    monthlyTax,
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
