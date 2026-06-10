// Pure logic for the Health Insurance Premium Calculator.
// Estimates an annual health insurance premium from age, plan tier, coverage
// region, tobacco use, household size and a few risk factors, then projects the
// monthly premium across age bands so users can see how cost rises with age.

export type PlanTier = "bronze" | "silver" | "gold" | "platinum";
export type CoverageRegion = "low" | "average" | "high";

export const TIER_FACTOR: Record<PlanTier, number> = {
  bronze: 0.85,
  silver: 1.0,
  gold: 1.2,
  platinum: 1.45,
};

export const REGION_FACTOR: Record<CoverageRegion, number> = {
  low: 0.88,
  average: 1.0,
  high: 1.18,
};

export interface HealthInsuranceInput {
  age: number;
  tier: PlanTier;
  region: CoverageRegion;
  tobacco: boolean;
  dependents: number; // additional people on the policy (spouse/children)
  baseRate: number; // benchmark monthly premium for a 21-year-old, USD
}

export interface PremiumAgePoint {
  age: number;
  monthly: number;
}

export interface HealthInsuranceResult {
  monthlyPremium: number;
  annualPremium: number;
  ageFactor: number;
  tobaccoSurcharge: number; // monthly USD added for tobacco
  dependentCost: number; // monthly USD added for dependents
  schedule: PremiumAgePoint[];
}

// Age rating curve: a smooth multiplier relative to a 21-year-old (1.0),
// modeled on common 3-to-1 community-rated bands (cap at 3x by age 64).
function ageFactorFor(age: number): number {
  const a = Math.max(0, age);
  if (a <= 20) return 0.635;
  if (a <= 21) return 1.0;
  // Roughly linear rise from 1.0 at 21 up to 3.0 at 64.
  const f = 1 + ((Math.min(a, 64) - 21) / (64 - 21)) * 2.0;
  return Math.min(3.0, f);
}

export function computeHealthInsurance(
  input: HealthInsuranceInput
): HealthInsuranceResult | null {
  const { age, tier, region, tobacco, dependents, baseRate } = input;

  if (!Number.isFinite(age) || age < 0 || age > 99) return null;
  if (!Number.isFinite(baseRate) || baseRate <= 0) return null;
  if (!Number.isFinite(dependents) || dependents < 0) return null;

  const tierF = TIER_FACTOR[tier];
  const regionF = REGION_FACTOR[region];

  const monthlyFor = (a: number, withExtras: boolean) => {
    const base = baseRate * ageFactorFor(a) * tierF * regionF;
    const tobaccoAdd = tobacco ? base * 0.25 : 0;
    // Each dependent adds a share of the primary premium (children count less).
    const depAdd = withExtras ? base * 0.6 * dependents : 0;
    return base + tobaccoAdd + depAdd;
  };

  const primaryBase = baseRate * ageFactorFor(age) * tierF * regionF;
  const tobaccoSurcharge = tobacco ? primaryBase * 0.25 : 0;
  const dependentCost = primaryBase * 0.6 * dependents;

  const monthlyPremium = monthlyFor(age, true);
  const annualPremium = monthlyPremium * 12;

  // Project the primary member's premium (no dependents) across age bands.
  const schedule: PremiumAgePoint[] = [];
  const start = Math.max(18, Math.floor(age / 5) * 5);
  for (let a = start; a <= 64; a += 5) {
    schedule.push({ age: a, monthly: monthlyFor(a, false) });
  }
  if (schedule.length === 0 || schedule[schedule.length - 1].age !== 64) {
    schedule.push({ age: 64, monthly: monthlyFor(64, false) });
  }

  return {
    monthlyPremium,
    annualPremium,
    ageFactor: ageFactorFor(age),
    tobaccoSurcharge,
    dependentCost,
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
