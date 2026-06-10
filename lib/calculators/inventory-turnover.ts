// Pure logic for the Inventory Turnover Calculator.
// Inventory turnover = cost of goods sold (COGS) divided by average inventory.
// Days inventory outstanding (DIO) = days in period divided by turnover.
// We also expose a per-month schedule showing cumulative stock cycles for charting.

export interface InventoryTurnoverInput {
  cogs: number; // cost of goods sold for the period
  averageInventory: number; // average inventory at cost
  daysInPeriod: number; // typically 365 for a year
}

export interface InventoryTurnoverMonthPoint {
  month: number; // 1..12
  cumulativeTurns: number; // turns accumulated by this month at a steady pace
}

export interface InventoryTurnoverResult {
  turnoverRatio: number; // times inventory sold and replaced
  daysOnHand: number; // average days to sell inventory
  dailyCogs: number; // cost of goods sold per day
  turnsPerMonth: number;
  schedule: InventoryTurnoverMonthPoint[];
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
  const dailyCogs = cogs / daysInPeriod;
  const turnsPerMonth = turnoverRatio / 12;

  const schedule: InventoryTurnoverMonthPoint[] = Array.from(
    { length: 12 },
    (_, i) => ({ month: i + 1, cumulativeTurns: turnsPerMonth * (i + 1) }),
  );

  return { turnoverRatio, daysOnHand, dailyCogs, turnsPerMonth, schedule };
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

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
