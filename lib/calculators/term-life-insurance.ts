// Pure logic for the Term Life Insurance Calculator.
// Estimates how much term life coverage a household needs using the DIME
// method — Debt, Income, Mortgage, Education — plus final expenses, then
// subtracts existing savings and life cover already in place. Returns a
// recommended coverage figure with an additive breakdown for display.

export interface TermLifeInput {
  annualIncome: number; // gross annual income to replace
  yearsToReplace: number; // how many years of income to provide for
  debts: number; // non-mortgage debts (cards, auto, student loans)
  mortgage: number; // remaining mortgage balance
  futureObligations: number; // future costs e.g. children's education
  finalExpenses: number; // funeral and end-of-life costs
  existingAssets: number; // savings and life cover to subtract
}

export interface TermLifeResult {
  recommendedCoverage: number; // total coverage need, floored at 0
  incomeReplacement: number; // annualIncome * yearsToReplace
  obligations: number; // debts + mortgage + futureObligations + finalExpenses
  lessExisting: number; // existingAssets subtracted from the total
}

export function computeTermLife(input: TermLifeInput): TermLifeResult | null {
  const {
    annualIncome,
    yearsToReplace,
    debts,
    mortgage,
    futureObligations,
    finalExpenses,
    existingAssets,
  } = input;

  if (!Number.isFinite(annualIncome) || annualIncome < 0) return null;
  if (!Number.isFinite(yearsToReplace) || yearsToReplace < 0) return null;
  if (!Number.isFinite(debts) || debts < 0) return null;
  if (!Number.isFinite(mortgage) || mortgage < 0) return null;
  if (!Number.isFinite(futureObligations) || futureObligations < 0) return null;
  if (!Number.isFinite(finalExpenses) || finalExpenses < 0) return null;
  if (!Number.isFinite(existingAssets) || existingAssets < 0) return null;

  const incomeReplacement = annualIncome * yearsToReplace;
  const obligations = debts + mortgage + futureObligations + finalExpenses;
  const lessExisting = existingAssets;

  const recommendedCoverage = Math.max(
    0,
    incomeReplacement + obligations - lessExisting
  );

  return {
    recommendedCoverage,
    incomeReplacement,
    obligations,
    lessExisting,
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
