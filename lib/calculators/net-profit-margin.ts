// Pure logic for the Net Profit Margin Calculator.
// Net profit margin is what fraction of revenue is left as profit after every
// expense — cost of goods, operating costs, interest and taxes. We derive net
// profit as revenue minus total expenses (which may be negative, i.e. a loss)
// and express it as a percentage of revenue.

export interface NetProfitMarginInput {
  revenue: number; // total revenue / sales for the period
  expenses: number; // total expenses for the period (all costs combined)
}

export interface NetProfitMarginResult {
  revenue: number;
  expenses: number;
  netProfit: number; // revenue - expenses (negative means a net loss)
  netMarginPct: number; // net profit as a percent of revenue
  isLoss: boolean; // true when net profit is below zero
}

export function computeNetProfitMargin(
  input: NetProfitMarginInput
): NetProfitMarginResult | null {
  const { revenue, expenses } = input;

  if (!Number.isFinite(revenue) || revenue <= 0) return null;
  if (!Number.isFinite(expenses) || expenses < 0) return null;

  const netProfit = revenue - expenses;
  const netMarginPct = (netProfit / revenue) * 100;

  return {
    revenue,
    expenses,
    netProfit,
    netMarginPct,
    isLoss: netProfit < 0,
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

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}
