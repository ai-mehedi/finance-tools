// Pure logic for the Cost of Living Comparison Calculator.
// Compares the spending power of a salary between two cities using a cost of
// living index for each. The equivalent salary needed in the destination city
// is currentSalary * (destIndex / currentIndex), where each index is relative
// to a national baseline of 100.

export interface CostOfLivingInput {
  currentSalary: number;
  currentIndex: number; // cost of living index for current city (baseline 100)
  destIndex: number; // cost of living index for destination city (baseline 100)
}

export interface CostOfLivingCategory {
  label: string;
  current: number; // weight points in current city
  dest: number; // weight points in destination city
}

export interface CostOfLivingResult {
  equivalentSalary: number; // salary needed in destination to keep the same standard of living
  difference: number; // equivalentSalary - currentSalary (extra you need; negative = you save)
  percentDifference: number; // percent change in overall cost of living
  cheaper: boolean; // true when the destination is cheaper overall
}

export function computeCostOfLiving(input: CostOfLivingInput): CostOfLivingResult | null {
  const { currentSalary, currentIndex, destIndex } = input;

  if (!Number.isFinite(currentSalary) || currentSalary < 0) return null;
  if (!Number.isFinite(currentIndex) || currentIndex <= 0) return null;
  if (!Number.isFinite(destIndex) || destIndex <= 0) return null;

  const ratio = destIndex / currentIndex;
  const equivalentSalary = currentSalary * ratio;
  const difference = equivalentSalary - currentSalary;
  const percentDifference = (ratio - 1) * 100;

  return {
    equivalentSalary,
    difference,
    percentDifference,
    cheaper: destIndex < currentIndex,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
