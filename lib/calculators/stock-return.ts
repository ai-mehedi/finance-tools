// Pure logic for the Stock Return Calculator.
// Measures the total return on a holding (price appreciation plus dividends)
// and converts it to an annualized (CAGR) figure over the holding period.
// Returns a per-year value schedule, growing the cost basis at the CAGR, for
// charting how the position compounded.

export interface StockReturnInput {
  shares: number;
  buyPrice: number;
  sellPrice: number;
  dividendPerShare: number; // total dividends received per share over the period
  years: number; // holding period in years (may be fractional)
}

export interface StockReturnYearPoint {
  year: number;
  value: number; // cost basis grown at the annualized return
}

export interface StockReturnResult {
  totalCost: number;
  priceGain: number; // appreciation only
  dividendIncome: number;
  totalReturn: number; // price gain plus dividends, in dollars
  totalReturnPct: number;
  annualizedPct: number; // CAGR of total return
  endingValue: number; // total cost plus total return
  schedule: StockReturnYearPoint[];
}

export function computeStockReturn(input: StockReturnInput): StockReturnResult | null {
  const { shares, buyPrice, sellPrice, dividendPerShare, years } = input;

  if (!Number.isFinite(shares) || shares <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) return null;
  if (!Number.isFinite(sellPrice) || sellPrice < 0) return null;
  if (!Number.isFinite(dividendPerShare) || dividendPerShare < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const totalCost = shares * buyPrice;
  const priceGain = (sellPrice - buyPrice) * shares;
  const dividendIncome = dividendPerShare * shares;
  const totalReturn = priceGain + dividendIncome;
  const endingValue = totalCost + totalReturn;
  const totalReturnPct = (totalReturn / totalCost) * 100;

  // CAGR on the ending value (which includes reinvested-style dividend income).
  const growthFactor = endingValue / totalCost;
  const annualizedPct = growthFactor > 0 ? (Math.pow(growthFactor, 1 / years) - 1) * 100 : -100;

  const cagr = annualizedPct / 100;
  const schedule: StockReturnYearPoint[] = [{ year: 0, value: totalCost }];
  const wholeYears = Math.max(1, Math.ceil(years));
  for (let yr = 1; yr <= wholeYears; yr++) {
    const t = Math.min(yr, years);
    schedule.push({ year: t, value: totalCost * Math.pow(1 + cagr, t) });
  }

  return {
    totalCost,
    priceGain,
    dividendIncome,
    totalReturn,
    totalReturnPct,
    annualizedPct,
    endingValue,
    schedule,
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
