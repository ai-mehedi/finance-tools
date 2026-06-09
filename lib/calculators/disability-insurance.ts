// Pure logic for the Disability Insurance Calculator.
// Estimates the monthly disability benefit you should aim to cover and the
// resulting coverage gap after existing benefits. Long term disability policies
// typically replace 60% of income, so the default target is a share of gross
// monthly income net of any coverage you already have.

export interface DisabilityInput {
  grossMonthlyIncome: number;
  replacementPct: number; // target income replacement, e.g. 60
  existingMonthlyBenefit: number; // employer or government benefit already in place
  monthlyEssentialExpenses: number; // rent, food, debts you must still pay
  benefitYears: number; // how long you would need the benefit
}

export interface DisabilityResult {
  targetMonthlyBenefit: number; // replacementPct of income
  coverageGap: number; // target minus existing benefit, floored at 0
  expenseGap: number; // essentials minus existing benefit, floored at 0
  recommendedMonthlyBenefit: number; // the larger of the two gaps
  totalCoverageNeeded: number; // recommended monthly * months over the benefit period
  components: { label: string; value: number }[];
}

export function computeDisability(input: DisabilityInput): DisabilityResult | null {
  const {
    grossMonthlyIncome,
    replacementPct,
    existingMonthlyBenefit,
    monthlyEssentialExpenses,
    benefitYears,
  } = input;

  if (!Number.isFinite(grossMonthlyIncome) || grossMonthlyIncome <= 0) return null;
  if (!Number.isFinite(replacementPct) || replacementPct < 0 || replacementPct > 100) return null;
  if (!Number.isFinite(existingMonthlyBenefit) || existingMonthlyBenefit < 0) return null;
  if (!Number.isFinite(monthlyEssentialExpenses) || monthlyEssentialExpenses < 0) return null;
  if (!Number.isFinite(benefitYears) || benefitYears <= 0) return null;

  const targetMonthlyBenefit = grossMonthlyIncome * (replacementPct / 100);
  const coverageGap = Math.max(0, targetMonthlyBenefit - existingMonthlyBenefit);
  const expenseGap = Math.max(0, monthlyEssentialExpenses - existingMonthlyBenefit);
  const recommendedMonthlyBenefit = Math.max(coverageGap, expenseGap);
  const months = Math.round(benefitYears * 12);
  const totalCoverageNeeded = recommendedMonthlyBenefit * months;

  const components = [
    { label: "Existing benefit", value: Math.min(existingMonthlyBenefit, targetMonthlyBenefit) },
    { label: "Coverage gap", value: coverageGap },
  ].filter((c) => c.value > 0);

  return {
    targetMonthlyBenefit,
    coverageGap,
    expenseGap,
    recommendedMonthlyBenefit,
    totalCoverageNeeded,
    components,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
