// Pure logic for the Home Insurance Calculator.
// Estimates an annual homeowners insurance premium from the dwelling rebuild
// cost (Coverage A), then layers on the standard HO-3 coverage components that
// are usually expressed as a percentage of the dwelling limit. Risk factors
// (location, claims history, deductible) adjust the base rate. A breakdown of
// each coverage's share is returned for a donut chart.

export type RiskLevel = "low" | "average" | "high";

export const RISK_FACTORS: Record<RiskLevel, number> = {
  low: 0.85,
  average: 1.0,
  high: 1.35,
};

export interface HomeInsuranceInput {
  dwellingCost: number; // Coverage A: cost to rebuild the home
  personalPropertyPct: number; // Coverage C, as % of dwelling (e.g. 50)
  liabilityCoverage: number; // Coverage E flat limit, e.g. 300000
  ratePerThousand: number; // base annual rate per $1,000 of dwelling
  riskLevel: RiskLevel;
  deductible: number; // higher deductible lowers premium
}

export interface CoverageSlice {
  label: string;
  limit: number;
  premium: number;
}

export interface HomeInsuranceResult {
  annualPremium: number;
  monthlyPremium: number;
  personalPropertyLimit: number;
  lossOfUseLimit: number; // Coverage D, 20% of dwelling
  otherStructuresLimit: number; // Coverage B, 10% of dwelling
  slices: CoverageSlice[];
}

export function computeHomeInsurance(input: HomeInsuranceInput): HomeInsuranceResult | null {
  const {
    dwellingCost,
    personalPropertyPct,
    liabilityCoverage,
    ratePerThousand,
    riskLevel,
    deductible,
  } = input;

  if (!Number.isFinite(dwellingCost) || dwellingCost <= 0) return null;
  if (!Number.isFinite(ratePerThousand) || ratePerThousand <= 0) return null;
  if (personalPropertyPct < 0 || liabilityCoverage < 0) return null;
  if (!Number.isFinite(deductible) || deductible < 0) return null;

  const otherStructuresLimit = dwellingCost * 0.1; // Coverage B
  const personalPropertyLimit = dwellingCost * (personalPropertyPct / 100); // Coverage C
  const lossOfUseLimit = dwellingCost * 0.2; // Coverage D

  const risk = RISK_FACTORS[riskLevel];

  // Base premium scales with dwelling cost. A standard $1,000 deductible is the
  // baseline; each extra $500 of deductible above that trims the premium ~3%.
  const deductibleCredit = Math.min(0.25, Math.max(0, (deductible - 1000) / 500) * 0.03);
  const deductibleFactor = 1 - deductibleCredit;

  const dwellingPremium = (dwellingCost / 1000) * ratePerThousand * risk * deductibleFactor;
  // Property and structures coverages add a small share scaled to their limits.
  const otherStructuresPremium = (otherStructuresLimit / 1000) * ratePerThousand * 0.6 * risk * deductibleFactor;
  const propertyPremium = (personalPropertyLimit / 1000) * ratePerThousand * 0.45 * risk * deductibleFactor;
  // Liability and medical payments are roughly flat regardless of home size.
  const liabilityPremium = (liabilityCoverage / 100000) * 22 * risk;

  const annualPremium =
    dwellingPremium + otherStructuresPremium + propertyPremium + liabilityPremium;

  const slices: CoverageSlice[] = [
    { label: "Dwelling", limit: dwellingCost, premium: dwellingPremium },
    { label: "Other structures", limit: otherStructuresLimit, premium: otherStructuresPremium },
    { label: "Personal property", limit: personalPropertyLimit, premium: propertyPremium },
    { label: "Liability", limit: liabilityCoverage, premium: liabilityPremium },
  ];

  return {
    annualPremium,
    monthlyPremium: annualPremium / 12,
    personalPropertyLimit,
    lossOfUseLimit,
    otherStructuresLimit,
    slices,
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
