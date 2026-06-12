// Pure logic for the Stock Profit Calculator.
// Works out the net profit or loss on a stock trade after buy and sell
// commissions, the return on the invested cost, and a small breakdown series
// (cost, proceeds, fees) for plotting.

export interface StockProfitInput {
  shares: number;
  buyPrice: number;
  sellPrice: number;
  buyCommission: number; // flat fee charged on the buy
  sellCommission: number; // flat fee charged on the sell
}

export interface StockProfitResult {
  totalCost: number; // shares times buy price plus buy commission
  totalProceeds: number; // shares times sell price minus sell commission
  grossProfit: number; // before any commissions
  totalCommission: number;
  netProfit: number; // after both commissions
  returnPct: number; // net profit divided by total cost, as a percent
  breakeven: number; // sell price per share that yields zero net profit
}

export function computeStockProfit(input: StockProfitInput): StockProfitResult | null {
  const { shares, buyPrice, sellPrice, buyCommission, sellCommission } = input;

  if (!Number.isFinite(shares) || shares <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice < 0) return null;
  if (!Number.isFinite(sellPrice) || sellPrice < 0) return null;
  if (!Number.isFinite(buyCommission) || !Number.isFinite(sellCommission)) return null;
  if (buyCommission < 0 || sellCommission < 0) return null;

  const totalCost = shares * buyPrice + buyCommission;
  const totalProceeds = shares * sellPrice - sellCommission;
  const grossProfit = (sellPrice - buyPrice) * shares;
  const totalCommission = buyCommission + sellCommission;
  const netProfit = totalProceeds - totalCost;
  const returnPct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const breakeven = (totalCost + sellCommission) / shares;

  return {
    totalCost,
    totalProceeds,
    grossProfit,
    totalCommission,
    netProfit,
    returnPct,
    breakeven,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
