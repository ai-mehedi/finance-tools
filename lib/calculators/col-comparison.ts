// Pure logic for the Cost of Living Comparison Calculator.
// Compares two cities using their cost of living index values and tells you the
// salary you would need in the destination city to keep the same standard of
// living, plus the percent difference across major expense categories.
//
//   Equivalent salary = current salary x (destination index / current index)
// Index values are relative numbers where a higher index means a more expensive
// city. A common baseline is 100 for a national average.

export interface ColComparisonInput {
  currentSalary: number;
  currentIndex: number; // cost of living index of current city
  destinationIndex: number; // cost of living index of destination city
}

export interface ColCategory {
  label: string;
  /** Share of a typical household budget, used to split the salary. */
  weight: number;
}

export interface ColComparisonResult {
  equivalentSalary: number; // salary needed in destination for same lifestyle
  difference: number; // equivalentSalary minus currentSalary
  percentChange: number; // percent change in overall cost of living
  ratio: number; // destinationIndex / currentIndex
  isCheaper: boolean;
}

// Approximate budget weights for a typical US household (sum to 1).
export const COL_CATEGORIES: ColCategory[] = [
  { label: "Housing", weight: 0.33 },
  { label: "Groceries", weight: 0.13 },
  { label: "Transportation", weight: 0.16 },
  { label: "Healthcare", weight: 0.08 },
  { label: "Utilities", weight: 0.07 },
  { label: "Other", weight: 0.23 },
];

export function computeColComparison(input: ColComparisonInput): ColComparisonResult | null {
  const { currentSalary, currentIndex, destinationIndex } = input;

  if (!Number.isFinite(currentSalary) || currentSalary <= 0) return null;
  if (!Number.isFinite(currentIndex) || currentIndex <= 0) return null;
  if (!Number.isFinite(destinationIndex) || destinationIndex <= 0) return null;

  const ratio = destinationIndex / currentIndex;
  const equivalentSalary = currentSalary * ratio;
  const difference = equivalentSalary - currentSalary;
  const percentChange = (ratio - 1) * 100;
  const isCheaper = ratio < 1;

  return { equivalentSalary, difference, percentChange, ratio, isCheaper };
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
