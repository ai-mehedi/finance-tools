// Pure logic for the Life Insurance Calculator.
// Estimates a coverage target using the DIME method: Debt, Income replacement,
// Mortgage and Education, less the assets and coverage you already have.

export interface LifeInsuranceInput {
  annualIncome: number;
  yearsToReplace: number; // how many years of income to cover
  mortgageBalance: number;
  otherDebts: number; // car loans, credit cards, personal loans
  educationCosts: number; // future tuition for children
  finalExpenses: number; // funeral and end of life costs
  existingSavings: number; // liquid savings and investments
  existingCoverage: number; // life insurance already in force
}

export interface LifeInsuranceComponent {
  label: string;
  value: number; // positive = need, negative = offset
}

export interface LifeInsuranceResult {
  incomeNeed: number;
  totalNeeds: number; // gross need before offsets
  totalOffsets: number; // savings + existing coverage
  coverageNeeded: number; // final recommended coverage, never below 0
  components: LifeInsuranceComponent[];
}

export function computeLifeInsurance(input: LifeInsuranceInput): LifeInsuranceResult | null {
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

  if (!Number.isFinite(annualIncome) || annualIncome < 0) return null;
  if (!Number.isFinite(yearsToReplace) || yearsToReplace < 0) return null;
  if (
    mortgageBalance < 0 ||
    otherDebts < 0 ||
    educationCosts < 0 ||
    finalExpenses < 0 ||
    existingSavings < 0 ||
    existingCoverage < 0
  ) {
    return null;
  }

  const incomeNeed = annualIncome * yearsToReplace;
  const totalNeeds =
    incomeNeed + mortgageBalance + otherDebts + educationCosts + finalExpenses;
  const totalOffsets = existingSavings + existingCoverage;
  const coverageNeeded = Math.max(0, totalNeeds - totalOffsets);

  const components: LifeInsuranceComponent[] = [
    { label: "Income replacement", value: incomeNeed },
    { label: "Mortgage", value: mortgageBalance },
    { label: "Other debts", value: otherDebts },
    { label: "Education", value: educationCosts },
    { label: "Final expenses", value: finalExpenses },
    { label: "Savings & coverage", value: -totalOffsets },
  ];

  return {
    incomeNeed,
    totalNeeds,
    totalOffsets,
    coverageNeeded,
    components,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
