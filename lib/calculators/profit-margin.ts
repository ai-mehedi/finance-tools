// Pure logic for the Profit Margin Calculator.
// Given revenue and cost, derives gross profit and the three margin views
// people usually want: net profit margin, markup, and the implied selling
// price per unit. Also returns a small breakdown for charting cost vs profit.

export type MarginMode = "revenue-cost" | "price-margin";

export interface ProfitMarginInput {
  revenue: number; // total revenue (sales)
  cost: number; // total cost of goods / expenses
}

export interface ProfitMarginSlice {
  label: string;
  value: number;
  color: string; // tailwind class for the donut/legend
}

export interface ProfitMarginResult {
  profit: number; // revenue minus cost
  marginPct: number; // profit divided by revenue, as a percent
  markupPct: number; // profit divided by cost, as a percent
  costRatioPct: number; // cost divided by revenue, as a percent
  slices: ProfitMarginSlice[];
}

export function computeProfitMargin(input: ProfitMarginInput): ProfitMarginResult | null {
  const { revenue, cost } = input;

  if (!Number.isFinite(revenue) || !Number.isFinite(cost)) return null;
  if (revenue <= 0) return null;
  if (cost < 0) return null;

  const profit = revenue - cost;
  const marginPct = (profit / revenue) * 100;
  const markupPct = cost > 0 ? (profit / cost) * 100 : 0;
  const costRatioPct = (cost / revenue) * 100;

  const slices: ProfitMarginSlice[] = [
    { label: "Cost", value: Math.max(cost, 0), color: "bg-zinc-300" },
    { label: "Profit", value: Math.max(profit, 0), color: "bg-orange-500" },
  ];

  return { profit, marginPct, markupPct, costRatioPct, slices };
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

export const formatPct = (n: number) => `${Number.isFinite(n) ? n.toFixed(1) : "0.0"}%`;
