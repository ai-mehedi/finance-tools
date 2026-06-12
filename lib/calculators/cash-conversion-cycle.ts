// Pure logic for the Cash Conversion Cycle (CCC) Calculator.
// Derives the three component metrics — Days Inventory Outstanding (DIO),
// Days Sales Outstanding (DSO) and Days Payable Outstanding (DPO) — from raw
// financial figures, then combines them into the cash conversion cycle:
// CCC = DIO + DSO − DPO. A 365-day period is assumed throughout.

export interface CashConversionCycleInput {
  revenue: number; // annual revenue / net sales
  cogs: number; // cost of goods sold
  avgInventory: number; // average inventory balance over the period
  avgReceivable: number; // average accounts receivable balance
  avgPayable: number; // average accounts payable balance
}

export interface CashConversionCycleResult {
  dio: number; // days inventory outstanding
  dso: number; // days sales outstanding
  dpo: number; // days payable outstanding
  ccc: number; // cash conversion cycle in days
}

const DAYS_IN_PERIOD = 365;

export function computeCashConversionCycle(
  input: CashConversionCycleInput
): CashConversionCycleResult | null {
  const { revenue, cogs, avgInventory, avgReceivable, avgPayable } = input;

  if (!Number.isFinite(revenue) || revenue <= 0) return null;
  if (!Number.isFinite(cogs) || cogs <= 0) return null;
  if (!Number.isFinite(avgInventory) || avgInventory < 0) return null;
  if (!Number.isFinite(avgReceivable) || avgReceivable < 0) return null;
  if (!Number.isFinite(avgPayable) || avgPayable < 0) return null;

  const dio = (avgInventory / cogs) * DAYS_IN_PERIOD;
  const dso = (avgReceivable / revenue) * DAYS_IN_PERIOD;
  const dpo = (avgPayable / cogs) * DAYS_IN_PERIOD;
  const ccc = dio + dso - dpo;

  return { dio, dso, dpo, ccc };
}

// Plain number/day formatters — the CCC and its components are measured in
// days, not currency, so we deliberately avoid the USD helpers here.
const dayFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatDays = (n: number) =>
  `${dayFmt.format(Number.isFinite(n) ? n : 0)} days`;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
