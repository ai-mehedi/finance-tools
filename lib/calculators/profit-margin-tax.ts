// Pure logic for the Profit Margin With Tax Calculator.
// Takes revenue and cost to get pre-tax (operating) profit, applies an income
// tax rate to the profit, and reports both the pre-tax and after-tax margins.
// Returns a small breakdown for charting cost, tax, and take-home profit.

export interface ProfitMarginTaxInput {
  revenue: number; // total revenue (sales)
  cost: number; // total cost of goods / expenses
  taxRatePct: number; // income tax rate applied to pre-tax profit
}

export interface ProfitMarginTaxSlice {
  label: string;
  value: number;
  color: string;
}

export interface ProfitMarginTaxResult {
  pretaxProfit: number; // revenue minus cost
  taxAmount: number; // tax charged on the pre-tax profit
  aftertaxProfit: number; // pre-tax profit minus tax
  pretaxMarginPct: number; // pre-tax profit divided by revenue, percent
  aftertaxMarginPct: number; // after-tax profit divided by revenue, percent
  slices: ProfitMarginTaxSlice[];
}

export function computeProfitMarginTax(input: ProfitMarginTaxInput): ProfitMarginTaxResult | null {
  const { revenue, cost, taxRatePct } = input;

  if (!Number.isFinite(revenue) || !Number.isFinite(cost) || !Number.isFinite(taxRatePct)) return null;
  if (revenue <= 0) return null;
  if (cost < 0 || taxRatePct < 0) return null;

  const pretaxProfit = revenue - cost;
  // Tax only applies to positive profit; a loss carries no tax here.
  const taxAmount = pretaxProfit > 0 ? pretaxProfit * (taxRatePct / 100) : 0;
  const aftertaxProfit = pretaxProfit - taxAmount;

  const pretaxMarginPct = (pretaxProfit / revenue) * 100;
  const aftertaxMarginPct = (aftertaxProfit / revenue) * 100;

  const slices: ProfitMarginTaxSlice[] = [
    { label: "Cost", value: Math.max(cost, 0), color: "bg-zinc-300" },
    { label: "Tax", value: Math.max(taxAmount, 0), color: "bg-orange-300" },
    { label: "After-tax profit", value: Math.max(aftertaxProfit, 0), color: "bg-orange-500" },
  ];

  return {
    pretaxProfit,
    taxAmount,
    aftertaxProfit,
    pretaxMarginPct,
    aftertaxMarginPct,
    slices,
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

export const formatPct = (n: number) => `${Number.isFinite(n) ? n.toFixed(1) : "0.0"}%`;
