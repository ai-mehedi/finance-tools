// Pure logic for the Stock Average Calculator.
// Computes the weighted-average cost per share across multiple buy lots
// (averaging down or up), the total shares, the total amount invested, and a
// running average after each lot so the path of your cost basis can be charted.

export interface StockLot {
  shares: number;
  price: number;
}

export interface StockAverageInput {
  lots: StockLot[];
}

export interface StockAverageStep {
  lot: number; // 1-based lot number this point reflects
  cumulativeShares: number;
  cumulativeCost: number;
  averagePrice: number; // running average cost basis after this lot
}

export interface StockAverageResult {
  averagePrice: number;
  totalShares: number;
  totalCost: number;
  schedule: StockAverageStep[];
}

export function computeStockAverage(input: StockAverageInput): StockAverageResult | null {
  const valid = input.lots.filter(
    (l) => Number.isFinite(l.shares) && Number.isFinite(l.price) && l.shares > 0 && l.price >= 0,
  );

  if (valid.length === 0) return null;

  let cumulativeShares = 0;
  let cumulativeCost = 0;
  const schedule: StockAverageStep[] = [];

  valid.forEach((l, i) => {
    cumulativeShares += l.shares;
    cumulativeCost += l.shares * l.price;
    schedule.push({
      lot: i + 1,
      cumulativeShares,
      cumulativeCost,
      averagePrice: cumulativeCost / cumulativeShares,
    });
  });

  return {
    averagePrice: cumulativeCost / cumulativeShares,
    totalShares: cumulativeShares,
    totalCost: cumulativeCost,
    schedule,
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

// Per-share prices need cents, so expose a 2-decimal helper for the headline.
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
