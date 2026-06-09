// Pure logic for the Cost Per Use Calculator.
// Cost per use answers a simple question: how much does each use of an item
// really cost once you spread the price (and any running costs) across how
// many times you actually use it.

export interface CostPerUseInput {
  price: number; // upfront purchase price
  usesPerWeek: number; // how many times you use it each week
  ownershipWeeks: number; // how long you expect to own or keep it, in weeks
  runningCostPerWeek?: number; // optional recurring cost (maintenance, fees)
}

export interface CostPerUseResult {
  totalUses: number;
  totalCost: number; // price + running costs over the ownership period
  costPerUse: number;
  costPerWeek: number;
}

export function computeCostPerUse(input: CostPerUseInput): CostPerUseResult | null {
  const { price, usesPerWeek, ownershipWeeks, runningCostPerWeek = 0 } = input;

  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(usesPerWeek) || usesPerWeek <= 0) return null;
  if (!Number.isFinite(ownershipWeeks) || ownershipWeeks <= 0) return null;
  if (runningCostPerWeek < 0) return null;

  const totalUses = usesPerWeek * ownershipWeeks;
  const totalCost = price + runningCostPerWeek * ownershipWeeks;
  const costPerUse = totalUses > 0 ? totalCost / totalUses : 0;
  const costPerWeek = totalCost / ownershipWeeks;

  return { totalUses, totalCost, costPerUse, costPerWeek };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
