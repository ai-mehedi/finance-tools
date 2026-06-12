// Pure logic for the Savings Rate Calculator.
// Computes the personal savings rate: the share of take-home (or gross) income
// that is set aside rather than spent. Also estimates how many years of
// expenses you save per year, a rough proxy for progress toward independence.

export interface SavingsRateInput {
  monthlyIncome: number; // take-home or gross, user's choice
  monthlyExpenses: number;
  extraMonthlySavings: number; // amounts saved outside the income/expense gap, e.g. 401k match, side income saved
}

export interface SavingsRateResult {
  monthlySavings: number; // income minus expenses plus extra
  savingsRatePct: number; // percentage of income saved
  spendingRatePct: number; // percentage of income spent
  annualSavings: number;
  annualExpenses: number;
  yearsOfExpensesPerYear: number; // annualSavings / annualExpenses
}

export function computeSavingsRate(input: SavingsRateInput): SavingsRateResult | null {
  const { monthlyIncome, monthlyExpenses, extraMonthlySavings } = input;

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return null;
  if (!Number.isFinite(monthlyExpenses) || monthlyExpenses < 0) return null;
  if (!Number.isFinite(extraMonthlySavings) || extraMonthlySavings < 0) return null;

  const monthlySavings = monthlyIncome - monthlyExpenses + extraMonthlySavings;
  const savingsRatePct = (monthlySavings / monthlyIncome) * 100;
  const spendingRatePct = 100 - savingsRatePct;

  const annualSavings = monthlySavings * 12;
  const annualExpenses = monthlyExpenses * 12;
  const yearsOfExpensesPerYear =
    annualExpenses > 0 ? annualSavings / annualExpenses : 0;

  return {
    monthlySavings,
    savingsRatePct,
    spendingRatePct,
    annualSavings,
    annualExpenses,
    yearsOfExpensesPerYear,
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
