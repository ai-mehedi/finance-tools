// Pure logic for the Inventory Turnover Calculator.
// Inventory turnover = cost of goods sold / average inventory.
// Days inventory outstanding = days in period / turnover.

export interface InventoryTurnoverInput {
  cogs: number; // cost of goods sold for the period
  averageInventory: number; // average inventory at cost
  daysInPeriod: number; // typically 365 for a year
}

export interface InventoryTurnoverResult {
  turnoverRatio: number; // times inventory sold and replaced
  daysOnHand: number; // average days to sell inventory
}

export function computeInventoryTurnover(
  input: InventoryTurnoverInput,
): InventoryTurnoverResult | null {
  const { cogs, averageInventory, daysInPeriod } = input;

  if (!Number.isFinite(cogs) || cogs < 0) return null;
  if (!Number.isFinite(averageInventory) || averageInventory <= 0) return null;
  if (!Number.isFinite(daysInPeriod) || daysInPeriod <= 0) return null;

  const turnoverRatio = cogs / averageInventory;
  const daysOnHand = turnoverRatio > 0 ? daysInPeriod / turnoverRatio : 0;

  return { turnoverRatio, daysOnHand };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const numFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatNumber = (n: number) => numFmt.format(Number.isFinite(n) ? n : 0);
