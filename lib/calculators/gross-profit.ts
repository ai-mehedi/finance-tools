// Pure logic for the Gross Profit Calculator.
// Gross profit = revenue minus cost of goods sold (COGS).
// Also derives gross margin (profit as a share of revenue) and markup
// (profit as a share of cost), and a small per-unit breakdown for charting.

export interface GrossProfitInput {
  revenue: number; // total sales revenue
  cogs: number; // cost of goods sold
  unitsSold: number; // optional, for per-unit figures; 0 means skip
}

export interface GrossProfitBar {
  label: string;
  value: number;
  color: string;
}

export interface GrossProfitResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number; // profit / revenue * 100
  markupPct: number; // profit / cogs * 100
  costRatioPct: number; // cogs / revenue * 100
  perUnitRevenue: number;
  perUnitCost: number;
  perUnitProfit: number;
  hasUnits: boolean;
  bars: GrossProfitBar[];
}

export function computeGrossProfit(input: GrossProfitInput): GrossProfitResult | null {
  const { revenue, cogs, unitsSold } = input;

  if (!Number.isFinite(revenue) || revenue <= 0) return null;
  if (!Number.isFinite(cogs) || cogs < 0) return null;

  const grossProfit = revenue - cogs;
  const grossMarginPct = (grossProfit / revenue) * 100;
  const markupPct = cogs > 0 ? (grossProfit / cogs) * 100 : 0;
  const costRatioPct = (cogs / revenue) * 100;

  const hasUnits = Number.isFinite(unitsSold) && unitsSold > 0;
  const perUnitRevenue = hasUnits ? revenue / unitsSold : 0;
  const perUnitCost = hasUnits ? cogs / unitsSold : 0;
  const perUnitProfit = hasUnits ? grossProfit / unitsSold : 0;

  const bars: GrossProfitBar[] = [
    { label: "Revenue", value: revenue, color: "#a1a1aa" },
    { label: "COGS", value: cogs, color: "#fb923c" },
    { label: "Gross profit", value: Math.max(grossProfit, 0), color: "#f97316" },
  ];

  return {
    revenue,
    cogs,
    grossProfit,
    grossMarginPct,
    markupPct,
    costRatioPct,
    perUnitRevenue,
    perUnitCost,
    perUnitProfit,
    hasUnits,
    bars,
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
