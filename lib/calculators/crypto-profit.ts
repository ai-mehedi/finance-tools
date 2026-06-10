// Pure logic for the Crypto Profit Calculator.
// Works out the profit or loss on a single crypto trade given the amount invested
// (or the number of coins), the buy price, the sell price and optional percentage
// fees on each side. Exposes a small breakdown array for a bar chart.

export interface CryptoProfitInput {
  investment: number; // dollars put in (before buy fee)
  buyPrice: number; // price per coin when buying
  sellPrice: number; // price per coin when selling
  buyFeePct: number; // exchange fee on the buy, percent
  sellFeePct: number; // exchange fee on the sell, percent
}

export interface CryptoProfitResult {
  coins: number; // coins acquired after the buy fee
  grossProceeds: number; // coins times sell price, before sell fee
  netProceeds: number; // proceeds after the sell fee
  buyFee: number;
  sellFee: number;
  totalFees: number;
  profit: number; // net proceeds minus investment
  roiPct: number;
  breakEvenPrice: number; // sell price needed to break even after both fees
}

export function computeCryptoProfit(input: CryptoProfitInput): CryptoProfitResult | null {
  const { investment, buyPrice, sellPrice, buyFeePct, sellFeePct } = input;

  if (!Number.isFinite(investment) || investment <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) return null;
  if (!Number.isFinite(sellPrice) || sellPrice < 0) return null;
  if (!Number.isFinite(buyFeePct) || buyFeePct < 0) return null;
  if (!Number.isFinite(sellFeePct) || sellFeePct < 0) return null;

  const buyFee = investment * (buyFeePct / 100);
  const investedAfterFee = investment - buyFee;
  const coins = investedAfterFee / buyPrice;

  const grossProceeds = coins * sellPrice;
  const sellFee = grossProceeds * (sellFeePct / 100);
  const netProceeds = grossProceeds - sellFee;

  const totalFees = buyFee + sellFee;
  const profit = netProceeds - investment;
  const roiPct = (profit / investment) * 100;

  // Sell price at which net proceeds equal the original investment.
  // netProceeds = coins * P * (1 - sellFeePct/100) = investment
  const sellFactor = 1 - sellFeePct / 100;
  const breakEvenPrice =
    coins > 0 && sellFactor > 0 ? investment / (coins * sellFactor) : 0;

  return {
    coins,
    grossProceeds,
    netProceeds,
    buyFee,
    sellFee,
    totalFees,
    profit,
    roiPct,
    breakEvenPrice,
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
