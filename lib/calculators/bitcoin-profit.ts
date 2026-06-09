// Pure logic for the Bitcoin Profit Calculator.
// Computes the profit or loss on a bitcoin trade given a buy price, sell price,
// amount invested and optional trading fees on each side.

export interface BitcoinProfitInput {
  investment: number; // dollars put in at the buy
  buyPrice: number; // price per BTC when buying
  sellPrice: number; // price per BTC when selling
  buyFeePct?: number; // fee on the buy, as a percent
  sellFeePct?: number; // fee on the sell, as a percent
}

export interface BitcoinProfitResult {
  coins: number; // BTC actually held after the buy fee
  buyFee: number; // dollars paid in fees on the buy
  sellFee: number; // dollars paid in fees on the sell
  grossProceeds: number; // coins * sellPrice before the sell fee
  netProceeds: number; // proceeds after the sell fee
  profit: number; // netProceeds - investment
  roiPct: number; // profit / investment * 100
  totalFees: number; // buyFee + sellFee
  isProfit: boolean;
}

export function computeBitcoinProfit(input: BitcoinProfitInput): BitcoinProfitResult | null {
  const { investment, buyPrice, sellPrice, buyFeePct = 0, sellFeePct = 0 } = input;

  if (!Number.isFinite(investment) || investment <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice <= 0) return null;
  if (!Number.isFinite(sellPrice) || sellPrice < 0) return null;
  if (buyFeePct < 0 || sellFeePct < 0) return null;

  const buyFee = investment * (buyFeePct / 100);
  const investedAfterFee = investment - buyFee;
  const coins = investedAfterFee / buyPrice;

  const grossProceeds = coins * sellPrice;
  const sellFee = grossProceeds * (sellFeePct / 100);
  const netProceeds = grossProceeds - sellFee;

  const profit = netProceeds - investment;
  const roiPct = (profit / investment) * 100;
  const totalFees = buyFee + sellFee;

  return {
    coins,
    buyFee,
    sellFee,
    grossProceeds,
    netProceeds,
    profit,
    roiPct,
    totalFees,
    isProfit: profit >= 0,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const btcFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });
export const formatBTC = (n: number) => `${btcFmt.format(Number.isFinite(n) ? n : 0)} BTC`;

const pctFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatPct = (n: number) => `${pctFmt.format(Number.isFinite(n) ? n : 0)}%`;
