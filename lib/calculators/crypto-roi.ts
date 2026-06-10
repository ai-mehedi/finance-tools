// Pure logic for the Crypto ROI Calculator.
// Computes return on a crypto position from a buy price, sell price and amount
// invested, accounting for trading fees on both legs. Also derives the number
// of coins, profit/loss, ROI percentage and an optional annualized return when
// a holding period is supplied. Exposes a small schedule of price scenarios for
// charting profit across a range of exit prices.

export interface CryptoRoiInput {
  investment: number; // amount of money put in (before buy fee), in USD
  buyPrice: number; // price per coin at entry
  sellPrice: number; // price per coin at exit
  feePct: number; // exchange fee per trade, as a percentage (applied to buy and sell)
  holdingDays: number; // 0 or NaN means "skip annualized figure"
}

export interface CryptoRoiScenarioPoint {
  price: number; // a hypothetical exit price
  profit: number; // net profit/loss at that exit price
}

export interface CryptoRoiResult {
  coins: number; // coins acquired after the buy fee
  grossProceeds: number; // coins times sell price, before sell fee
  buyFee: number;
  sellFee: number;
  totalFees: number;
  netProceeds: number; // what lands back in your pocket after the sell fee
  profit: number; // netProceeds minus investment
  roiPct: number; // profit divided by investment, as a percentage
  annualizedPct: number | null; // CAGR if a holding period was provided
  schedule: CryptoRoiScenarioPoint[];
}

export function computeCryptoRoi(input: CryptoRoiInput): CryptoRoiResult | null {
  const { investment, buyPrice, sellPrice, feePct, holdingDays } = input;

  if (!Number.isFinite(investment) || investment <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) return null;
  if (!Number.isFinite(sellPrice) || sellPrice < 0) return null;
  if (!Number.isFinite(feePct) || feePct < 0) return null;

  const feeRate = feePct / 100;

  // Buy: fee skims off the top, the rest buys coins.
  const buyFee = investment * feeRate;
  const coins = (investment - buyFee) / buyPrice;

  // Profit at any given exit price, net of the sell fee.
  const profitAt = (price: number) => {
    const gross = coins * price;
    const fee = gross * feeRate;
    return gross - fee - investment;
  };

  const grossProceeds = coins * sellPrice;
  const sellFee = grossProceeds * feeRate;
  const netProceeds = grossProceeds - sellFee;
  const totalFees = buyFee + sellFee;
  const profit = netProceeds - investment;
  const roiPct = (profit / investment) * 100;

  let annualizedPct: number | null = null;
  if (Number.isFinite(holdingDays) && holdingDays > 0) {
    const years = holdingDays / 365;
    const totalReturn = netProceeds / investment; // ratio of money back to money in
    if (totalReturn > 0) {
      annualizedPct = (Math.pow(totalReturn, 1 / years) - 1) * 100;
    }
  }

  // Scenario schedule: sweep exit prices from 0 to twice the higher of buy/sell.
  const top = Math.max(buyPrice, sellPrice) * 2;
  const steps = 24;
  const schedule: CryptoRoiScenarioPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = (top / steps) * i;
    schedule.push({ price, profit: profitAt(price) });
  }

  return {
    coins,
    grossProceeds,
    buyFee,
    sellFee,
    totalFees,
    netProceeds,
    profit,
    roiPct,
    annualizedPct,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
