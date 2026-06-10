// Pure logic for the Income Protection Calculator.
// Income protection insurance pays a monthly benefit if illness or injury stops
// you working. This tool sizes a sensible monthly benefit (capped at a maximum
// percentage of income that insurers will typically cover), nets off any
// existing cover, and projects the total benefit paid out over the claim period
// up to retirement, after a chosen waiting (deferred) period.

export interface IncomeProtectionInput {
  annualIncome: number; // gross annual income
  coverPct: number; // % of income you want to replace (typically up to ~65%)
  monthlyEssentialExpenses: number; // your committed monthly outgoings
  existingMonthlyCover: number; // monthly benefit already insured
  waitingWeeks: number; // deferred period before benefit starts
  currentAge: number;
  retirementAge: number;
}

export interface IncomeProtectionYearPoint {
  year: number; // claim year (1 = first year benefit pays)
  age: number;
  cumulativeBenefit: number; // total paid by end of that year
}

export interface IncomeProtectionResult {
  recommendedMonthlyBenefit: number; // capped benefit you should target
  additionalMonthlyBenefit: number; // gap after existing cover
  monthlyShortfall: number; // expenses minus benefit (if positive = uncovered)
  coversExpenses: boolean;
  maxBenefitMonthly: number; // insurer cap (65% of income / 12)
  benefitPeriodYears: number; // years to retirement
  totalBenefitToRetirement: number; // benefit times months payable
  waitingDays: number;
  schedule: IncomeProtectionYearPoint[];
}

const MAX_REPLACEMENT_PCT = 65; // typical insurer ceiling

export function computeIncomeProtection(
  input: IncomeProtectionInput
): IncomeProtectionResult | null {
  const {
    annualIncome,
    coverPct,
    monthlyEssentialExpenses,
    existingMonthlyCover,
    waitingWeeks,
    currentAge,
    retirementAge,
  } = input;

  if (!(annualIncome > 0)) return null;
  if (coverPct <= 0 || coverPct > 100) return null;
  if (monthlyEssentialExpenses < 0 || existingMonthlyCover < 0) return null;
  if (waitingWeeks < 0) return null;
  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAge) return null;

  const monthlyIncome = annualIncome / 12;
  const maxBenefitMonthly = (annualIncome * (MAX_REPLACEMENT_PCT / 100)) / 12;

  // Desired benefit from the chosen replacement %, capped at the insurer ceiling.
  const desired = monthlyIncome * (coverPct / 100);
  const recommendedMonthlyBenefit = Math.min(desired, maxBenefitMonthly);

  const additionalMonthlyBenefit = Math.max(
    0,
    recommendedMonthlyBenefit - existingMonthlyCover
  );

  const monthlyShortfall = monthlyEssentialExpenses - recommendedMonthlyBenefit;
  const coversExpenses = monthlyShortfall <= 0;

  const benefitPeriodYears = Math.round(retirementAge - currentAge);
  const waitingDays = Math.round(waitingWeeks * 7);

  // Build a cumulative payout schedule (benefit assumed to run to retirement).
  const schedule: IncomeProtectionYearPoint[] = [
    { year: 0, age: currentAge, cumulativeBenefit: 0 },
  ];
  let cumulative = 0;
  for (let y = 1; y <= benefitPeriodYears; y++) {
    cumulative += recommendedMonthlyBenefit * 12;
    schedule.push({
      year: y,
      age: currentAge + y,
      cumulativeBenefit: cumulative,
    });
  }
  const totalBenefitToRetirement = cumulative;

  return {
    recommendedMonthlyBenefit,
    additionalMonthlyBenefit,
    monthlyShortfall,
    coversExpenses,
    maxBenefitMonthly,
    benefitPeriodYears,
    totalBenefitToRetirement,
    waitingDays,
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
