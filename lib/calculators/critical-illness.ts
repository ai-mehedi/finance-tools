// Pure logic for the Critical Illness Cover Calculator.
// Estimates a recommended critical illness (CI) lump sum that would replace lost
// income during recovery, clear outstanding debts, fund medical treatment and
// keep an emergency buffer, then subtracts any cover you already hold.
// Returns a component breakdown for a donut/bar chart.

export interface CriticalIllnessInput {
  annualIncome: number; // gross annual income
  incomeYears: number; // years of income to replace while recovering
  monthlyExpenses: number; // ongoing household running costs per month
  outstandingDebt: number; // mortgage, loans, cards to clear
  treatmentCost: number; // out-of-pocket medical / rehab costs
  existingCover: number; // CI cover you already have
}

export interface CoverComponent {
  label: string;
  value: number;
  color: string; // fill used by the donut chart
}

export interface CriticalIllnessResult {
  recommendedCover: number; // total need before existing cover
  coverGap: number; // need minus existing cover, floored at 0
  incomeReplacement: number;
  expenseBuffer: number;
  debtClearing: number;
  treatment: number;
  components: CoverComponent[];
}

// Roughly a year of expenses held back as a recovery buffer on top of income.
const BUFFER_MONTHS = 12;

export function computeCriticalIllness(input: CriticalIllnessInput): CriticalIllnessResult | null {
  const {
    annualIncome,
    incomeYears,
    monthlyExpenses,
    outstandingDebt,
    treatmentCost,
    existingCover,
  } = input;

  if (!Number.isFinite(incomeYears) || incomeYears < 0) return null;
  if (
    annualIncome < 0 ||
    monthlyExpenses < 0 ||
    outstandingDebt < 0 ||
    treatmentCost < 0 ||
    existingCover < 0
  ) {
    return null;
  }
  if (
    !Number.isFinite(annualIncome) ||
    !Number.isFinite(monthlyExpenses) ||
    !Number.isFinite(outstandingDebt) ||
    !Number.isFinite(treatmentCost) ||
    !Number.isFinite(existingCover)
  ) {
    return null;
  }

  const incomeReplacement = annualIncome * incomeYears;
  const expenseBuffer = monthlyExpenses * BUFFER_MONTHS;
  const debtClearing = outstandingDebt;
  const treatment = treatmentCost;

  const recommendedCover = incomeReplacement + expenseBuffer + debtClearing + treatment;
  const coverGap = Math.max(0, recommendedCover - existingCover);

  const components: CoverComponent[] = [
    { label: "Income replacement", value: incomeReplacement, color: "#f97316" },
    { label: "Expense buffer", value: expenseBuffer, color: "#fb923c" },
    { label: "Debt clearing", value: debtClearing, color: "#fdba74" },
    { label: "Treatment costs", value: treatment, color: "#fed7aa" },
  ];

  return {
    recommendedCover,
    coverGap,
    incomeReplacement,
    expenseBuffer,
    debtClearing,
    treatment,
    components,
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
