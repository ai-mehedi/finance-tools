// Pure logic for the Markup Calculator.
// Given a cost and a markup percentage, derives the selling price, the profit
// per unit and the resulting gross margin. Markup is profit as a share of cost;
// margin is profit as a share of the selling price. Also returns a small
// schedule showing the price at several markup levels for a comparison chart.

export interface MarkupInput {
  cost: number;
  markupPct: number;
}

export interface MarkupPricePoint {
  markupPct: number;
  price: number;
  profit: number;
}

export interface MarkupResult {
  cost: number;
  markupPct: number;
  profit: number;
  price: number;
  marginPct: number; // profit / price * 100
  schedule: MarkupPricePoint[];
}

export function computeMarkup(input: MarkupInput): MarkupResult | null {
  const { cost, markupPct } = input;

  if (!Number.isFinite(cost) || cost < 0) return null;
  if (!Number.isFinite(markupPct) || markupPct < 0) return null;

  const profit = cost * (markupPct / 100);
  const price = cost + profit;
  const marginPct = price > 0 ? (profit / price) * 100 : 0;

  // Build a comparison schedule of common markup levels around the chosen one.
  const levels = new Set<number>([10, 25, 50, 75, 100, Math.round(markupPct)]);
  const schedule: MarkupPricePoint[] = Array.from(levels)
    .filter((m) => Number.isFinite(m) && m >= 0)
    .sort((a, b) => a - b)
    .map((m) => {
      const p = cost * (m / 100);
      return { markupPct: m, price: cost + p, profit: p };
    });

  return { cost, markupPct, profit, price, marginPct, schedule };
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
