// Pure logic for the Crypto Average Buy Calculator.
// Computes the weighted average entry price across several buys (dollar cost
// averaging), the total coins held, total invested, and break-even price.
// Optionally compares against a current price to show unrealized profit/loss.
// Returns a per-buy schedule so the running average can be charted.

export interface CryptoBuy {
  price: number; // price paid per coin on this buy
  amount: number; // quantity of coins bought
}

export interface CryptoAverageInput {
  buys: CryptoBuy[];
  currentPrice: number; // 0 or non-finite means "skip P/L"
}

export interface CryptoAveragePoint {
  index: number; // 1-based buy number
  coins: number; // cumulative coins after this buy
  invested: number; // cumulative dollars after this buy
  avgPrice: number; // running weighted average price
}

export interface CryptoAverageResult {
  averagePrice: number; // weighted average cost basis per coin
  totalCoins: number;
  totalInvested: number;
  currentValue: number; // totalCoins times currentPrice (0 if no price)
  profitLoss: number; // currentValue minus totalInvested
  profitLossPct: number; // relative to invested
  hasCurrentPrice: boolean;
  schedule: CryptoAveragePoint[];
}

export function computeCryptoAverage(input: CryptoAverageInput): CryptoAverageResult | null {
  const { buys, currentPrice } = input;
  if (!Array.isArray(buys) || buys.length === 0) return null;

  let totalCoins = 0;
  let totalInvested = 0;
  const schedule: CryptoAveragePoint[] = [];

  for (let i = 0; i < buys.length; i++) {
    const { price, amount } = buys[i];
    if (!Number.isFinite(price) || !Number.isFinite(amount)) return null;
    if (price < 0 || amount < 0) return null;
    totalCoins += amount;
    totalInvested += price * amount;
    schedule.push({
      index: i + 1,
      coins: totalCoins,
      invested: totalInvested,
      avgPrice: totalCoins > 0 ? totalInvested / totalCoins : 0,
    });
  }

  if (totalCoins <= 0) return null;

  const averagePrice = totalInvested / totalCoins;
  const hasCurrentPrice = Number.isFinite(currentPrice) && currentPrice > 0;
  const currentValue = hasCurrentPrice ? totalCoins * currentPrice : 0;
  const profitLoss = hasCurrentPrice ? currentValue - totalInvested : 0;
  const profitLossPct = hasCurrentPrice && totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return {
    averagePrice,
    totalCoins,
    totalInvested,
    currentValue,
    profitLoss,
    profitLossPct,
    hasCurrentPrice,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

// Finer-grained formatter for per-coin prices, which can be fractions of a dollar.
const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (n: number) => usdPrecise.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
