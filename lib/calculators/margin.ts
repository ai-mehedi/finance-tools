// Pure logic for the Margin Calculator.
// Given a cost and either a revenue (selling price) or a target gross margin,
// derives revenue, gross profit, gross margin percent and the implied markup.
// Margin is profit as a share of revenue; markup is profit as a share of cost.

export type MarginMode = "fromPrice" | "fromMargin";

export interface MarginInput {
  cost: number;
  // When mode is "fromPrice" we read revenue; when "fromMargin" we read targetMarginPct.
  revenue: number;
  targetMarginPct: number;
  mode: MarginMode;
}

export interface MarginBreakdownPoint {
  // A point on the cost-to-price split used for the donut/bar chart.
  label: string;
  value: number;
}

export interface MarginResult {
  cost: number;
  revenue: number;
  grossProfit: number;
  marginPct: number; // profit / revenue * 100
  markupPct: number; // profit / cost * 100
  breakdown: MarginBreakdownPoint[];
}

export function computeMargin(input: MarginInput): MarginResult | null {
  const { cost, mode } = input;

  if (!Number.isFinite(cost) || cost < 0) return null;

  let revenue: number;

  if (mode === "fromMargin") {
    const m = input.targetMarginPct;
    if (!Number.isFinite(m) || m >= 100) return null;
    // revenue = cost / (1 - margin)
    revenue = cost / (1 - m / 100);
  } else {
    revenue = input.revenue;
    if (!Number.isFinite(revenue) || revenue < 0) return null;
  }

  if (!Number.isFinite(revenue) || revenue <= 0) return null;

  const grossProfit = revenue - cost;
  const marginPct = (grossProfit / revenue) * 100;
  const markupPct = cost > 0 ? (grossProfit / cost) * 100 : 0;

  const breakdown: MarginBreakdownPoint[] = [
    { label: "Cost", value: cost },
    { label: "Gross profit", value: grossProfit },
  ];

  return { cost, revenue, grossProfit, marginPct, markupPct, breakdown };
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
