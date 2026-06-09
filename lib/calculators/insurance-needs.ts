// Pure logic for the Insurance Needs Calculator.
// Uses the DIME method: Debt, Income replacement, Mortgage and Education.
// Recommended cover = outstanding debts + income replacement + mortgage
// balance + future education costs, minus existing assets and current cover.

export interface InsuranceNeedsInput {
  annualIncome: number;
  yearsToReplace: number; // how many years of income to cover
  mortgageBalance: number;
  otherDebts: number; // credit cards, car loans, etc.
  educationCosts: number; // future costs for children
  finalExpenses: number; // funeral and end of life costs
  existingSavings: number; // liquid assets earmarked for the family
  existingCoverage: number; // life cover already in place
}

export interface InsuranceNeedsResult {
  incomeReplacement: number;
  mortgageBalance: number;
  otherDebts: number;
  educationCosts: number;
  finalExpenses: number;
  totalNeed: number; // gross need before offsets
  offsets: number; // savings + existing coverage
  recommendedCoverage: number; // net additional cover needed
}

export function computeInsuranceNeeds(
  input: InsuranceNeedsInput,
): InsuranceNeedsResult | null {
  const {
    annualIncome,
    yearsToReplace,
    mortgageBalance,
    otherDebts,
    educationCosts,
    finalExpenses,
    existingSavings,
    existingCoverage,
  } = input;

  const values = [
    annualIncome,
    yearsToReplace,
    mortgageBalance,
    otherDebts,
    educationCosts,
    finalExpenses,
    existingSavings,
    existingCoverage,
  ];
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;

  const incomeReplacement = annualIncome * yearsToReplace;
  const totalNeed =
    incomeReplacement +
    mortgageBalance +
    otherDebts +
    educationCosts +
    finalExpenses;
  const offsets = existingSavings + existingCoverage;
  const recommendedCoverage = Math.max(0, totalNeed - offsets);

  return {
    incomeReplacement,
    mortgageBalance,
    otherDebts,
    educationCosts,
    finalExpenses,
    totalNeed,
    offsets,
    recommendedCoverage,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
