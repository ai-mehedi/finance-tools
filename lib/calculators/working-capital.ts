// Pure logic for the Working Capital Calculator.
// Working capital measures the short-term liquidity cushion of a business:
// current assets minus current liabilities. This module also derives the common
// liquidity ratios (current and quick ratio) and breaks down current assets so
// they can be charted, since the mix of cash, receivables and inventory matters
// as much as the total.

export interface WorkingCapitalInput {
  cash: number; // cash and cash equivalents
  receivables: number; // accounts receivable
  inventory: number; // inventory on hand
  otherCurrentAssets: number; // prepaid expenses, short-term investments, etc.
  payables: number; // accounts payable
  shortTermDebt: number; // notes/loans due within a year
  otherCurrentLiabilities: number; // accrued expenses, taxes due, etc.
}

export interface WorkingCapitalResult {
  currentAssets: number;
  currentLiabilities: number;
  workingCapital: number; // current assets minus current liabilities
  currentRatio: number; // current assets divided by current liabilities
  quickRatio: number; // (current assets minus inventory) over liabilities
  netWorkingCapitalRatio: number; // working capital divided by current assets
  status: "healthy" | "tight" | "negative";
  assetMix: { label: string; value: number; color: string }[]; // for the donut
}

export function computeWorkingCapital(input: WorkingCapitalInput): WorkingCapitalResult | null {
  const {
    cash,
    receivables,
    inventory,
    otherCurrentAssets,
    payables,
    shortTermDebt,
    otherCurrentLiabilities,
  } = input;

  const values = [
    cash,
    receivables,
    inventory,
    otherCurrentAssets,
    payables,
    shortTermDebt,
    otherCurrentLiabilities,
  ];
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;

  const currentAssets = cash + receivables + inventory + otherCurrentAssets;
  const currentLiabilities = payables + shortTermDebt + otherCurrentLiabilities;
  if (currentAssets <= 0 && currentLiabilities <= 0) return null;

  const workingCapital = currentAssets - currentLiabilities;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : Infinity;
  const quickRatio =
    currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : Infinity;
  const netWorkingCapitalRatio = currentAssets > 0 ? workingCapital / currentAssets : 0;

  let status: WorkingCapitalResult["status"];
  if (workingCapital < 0) status = "negative";
  else if (Number.isFinite(currentRatio) && currentRatio < 1.2) status = "tight";
  else status = "healthy";

  const assetMix = [
    { label: "Cash", value: cash, color: "#f97316" },
    { label: "Receivables", value: receivables, color: "#fb923c" },
    { label: "Inventory", value: inventory, color: "#fdba74" },
    { label: "Other", value: otherCurrentAssets, color: "#fed7aa" },
  ].filter((s) => s.value > 0);

  return {
    currentAssets,
    currentLiabilities,
    workingCapital,
    currentRatio,
    quickRatio,
    netWorkingCapitalRatio,
    status,
    assetMix,
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

export const formatRatio = (n: number) =>
  Number.isFinite(n) ? `${n.toFixed(2)}×` : "∞";
