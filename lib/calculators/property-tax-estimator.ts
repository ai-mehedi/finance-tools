// Pure logic for the Property Tax Estimator.
// Unlike a single-rate calculator, this estimator stacks several local levies
// (county, city, school district and any special assessments) and adds an
// optional flat fee, then returns the blended rate and a breakdown of where
// each dollar of tax goes — useful for plotting a donut of the levy mix.

export interface LevyInput {
  countyRatePct: number; // county tax rate, percent of taxable value
  cityRatePct: number; // municipal / city tax rate
  schoolRatePct: number; // school district tax rate
  specialRatePct: number; // special districts (fire, water, library, etc.)
  flatFee: number; // fixed annual charge added on top
}

export interface PropertyTaxEstimatorInput extends LevyInput {
  homeValue: number; // market value of the property
  assessmentRatioPct: number; // taxable value as a percent of market value
  exemption: number; // dollar reduction to taxable value
}

export interface LevyLine {
  label: string;
  ratePct: number;
  amount: number;
}

export interface PropertyTaxEstimatorResult {
  taxableValue: number;
  blendedRatePct: number; // sum of all percentage levies
  leviesTotal: number; // tax from percentage levies only
  flatFee: number;
  annualTax: number; // levies plus flat fee
  monthlyTax: number;
  lines: LevyLine[]; // one entry per levy, for the donut/breakdown
}

const LEVY_LABELS: { key: keyof LevyInput; label: string }[] = [
  { key: "countyRatePct", label: "County" },
  { key: "cityRatePct", label: "City / municipal" },
  { key: "schoolRatePct", label: "School district" },
  { key: "specialRatePct", label: "Special districts" },
];

export function computePropertyTaxEstimate(
  input: PropertyTaxEstimatorInput
): PropertyTaxEstimatorResult | null {
  const {
    homeValue,
    assessmentRatioPct,
    exemption,
    countyRatePct,
    cityRatePct,
    schoolRatePct,
    specialRatePct,
    flatFee,
  } = input;

  if (!Number.isFinite(homeValue) || homeValue <= 0) return null;
  if (!Number.isFinite(assessmentRatioPct) || assessmentRatioPct <= 0) return null;
  if (exemption < 0 || flatFee < 0) return null;

  const rates = [countyRatePct, cityRatePct, schoolRatePct, specialRatePct];
  if (rates.some((r) => !Number.isFinite(r) || r < 0)) return null;

  const taxableValue = Math.max(0, homeValue * (assessmentRatioPct / 100) - exemption);

  const lines: LevyLine[] = LEVY_LABELS.map(({ key, label }) => {
    const ratePct = input[key];
    return { label, ratePct, amount: taxableValue * (ratePct / 100) };
  });

  const leviesTotal = lines.reduce((s, l) => s + l.amount, 0);
  const blendedRatePct = rates.reduce((s, r) => s + r, 0);
  const annualTax = leviesTotal + flatFee;
  const monthlyTax = annualTax / 12;

  return {
    taxableValue,
    blendedRatePct,
    leviesTotal,
    flatFee,
    annualTax,
    monthlyTax,
    lines,
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
