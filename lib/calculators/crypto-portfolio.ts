// Pure logic for the Crypto Portfolio Calculator.
// Takes a list of holdings (coin, quantity, buy price, current price) and rolls
// them up into a total value, total cost, profit/loss and per-coin allocation.
// Exposes a per-holding breakdown for a donut allocation chart.

export interface Holding {
  symbol: string;
  quantity: number;
  buyPrice: number; // average price paid per unit
  currentPrice: number;
}

export interface HoldingResult {
  symbol: string;
  quantity: number;
  cost: number; // quantity times buy price
  value: number; // quantity times current price
  profit: number;
  roiPct: number;
  allocationPct: number; // share of total current value
}

export interface CryptoPortfolioResult {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalRoiPct: number;
  holdings: HoldingResult[];
}

export function computeCryptoPortfolio(holdings: Holding[]): CryptoPortfolioResult | null {
  const valid = holdings.filter(
    (h) =>
      Number.isFinite(h.quantity) &&
      h.quantity > 0 &&
      Number.isFinite(h.buyPrice) &&
      h.buyPrice >= 0 &&
      Number.isFinite(h.currentPrice) &&
      h.currentPrice >= 0,
  );

  if (valid.length === 0) return null;

  let totalCost = 0;
  let totalValue = 0;

  const computed = valid.map((h) => {
    const cost = h.quantity * h.buyPrice;
    const value = h.quantity * h.currentPrice;
    totalCost += cost;
    totalValue += value;
    return { h, cost, value };
  });

  const holdingResults: HoldingResult[] = computed.map(({ h, cost, value }) => {
    const profit = value - cost;
    return {
      symbol: h.symbol || "—",
      quantity: h.quantity,
      cost,
      value,
      profit,
      roiPct: cost > 0 ? (profit / cost) * 100 : 0,
      allocationPct: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  const totalProfit = totalValue - totalCost;

  return {
    totalCost,
    totalValue,
    totalProfit,
    totalRoiPct: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
    holdings: holdingResults,
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
