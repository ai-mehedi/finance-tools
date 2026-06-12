// Pure logic for the Social Security Calculator.
// Estimates the monthly U.S. Social Security retirement benefit for a chosen
// claiming age, starting from an estimated benefit at full retirement age (FRA).
// Claiming before FRA permanently reduces the benefit; delaying past FRA earns
// delayed retirement credits up to age 70. Returns the adjusted monthly and
// annual benefit plus a schedule of the benefit at every claiming age for a chart.
//
// Reduction rules (Social Security Administration):
//  - 5/9 of 1% per month for the first 36 months before FRA
//  - 5/12 of 1% per month for each additional month before FRA
// Delayed credit (for those born 1943 or later): 8% per year, i.e. 2/3 of 1% per month.

export interface SocialSecurityInput {
  fraBenefit: number; // estimated monthly benefit at full retirement age
  fullRetirementAge: number; // typically 66 to 67
  claimAge: number; // age you start claiming, 62 to 70
}

export interface ClaimAgePoint {
  age: number;
  monthly: number;
  factor: number; // benefit as a fraction of the FRA amount
}

export interface SocialSecurityResult {
  monthlyBenefit: number;
  annualBenefit: number;
  factor: number; // claimAge benefit relative to FRA (1 = 100%)
  changeVsFra: number; // monthly difference versus the FRA benefit (signed)
  schedule: ClaimAgePoint[];
}

const MONTHLY_EARLY_FIRST36 = 5 / 9 / 100; // per month, first 36 months early
const MONTHLY_EARLY_BEYOND = 5 / 12 / 100; // per month, beyond 36 months early
const MONTHLY_DELAYED = 2 / 3 / 100; // per month delayed credit (8% per year)

// Benefit factor relative to the FRA amount for a given claim age.
export function benefitFactor(fullRetirementAge: number, claimAge: number): number {
  const monthsDiff = Math.round((claimAge - fullRetirementAge) * 12);

  if (monthsDiff === 0) return 1;

  if (monthsDiff < 0) {
    const early = -monthsDiff;
    const first = Math.min(early, 36);
    const beyond = Math.max(0, early - 36);
    const reduction = first * MONTHLY_EARLY_FIRST36 + beyond * MONTHLY_EARLY_BEYOND;
    return Math.max(0, 1 - reduction);
  }

  // Delayed credits stop accruing at age 70.
  const cappedMonths = Math.min(monthsDiff, Math.round((70 - fullRetirementAge) * 12));
  return 1 + cappedMonths * MONTHLY_DELAYED;
}

export function computeSocialSecurity(input: SocialSecurityInput): SocialSecurityResult | null {
  const { fraBenefit, fullRetirementAge, claimAge } = input;

  if (!Number.isFinite(fraBenefit) || fraBenefit <= 0) return null;
  if (!Number.isFinite(fullRetirementAge) || fullRetirementAge < 65 || fullRetirementAge > 67) return null;
  if (!Number.isFinite(claimAge) || claimAge < 62 || claimAge > 70) return null;

  const factor = benefitFactor(fullRetirementAge, claimAge);
  const monthlyBenefit = fraBenefit * factor;
  const annualBenefit = monthlyBenefit * 12;
  const changeVsFra = monthlyBenefit - fraBenefit;

  const schedule: ClaimAgePoint[] = [];
  for (let age = 62; age <= 70; age++) {
    const f = benefitFactor(fullRetirementAge, age);
    schedule.push({ age, monthly: fraBenefit * f, factor: f });
  }

  return { monthlyBenefit, annualBenefit, factor, changeVsFra, schedule };
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
