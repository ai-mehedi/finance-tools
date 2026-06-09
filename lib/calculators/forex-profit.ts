// Pure logic for the Forex Profit Calculator.
// Profit on a forex trade is the price move times the position size, with the sign
// flipped for sell trades. We work in the quote currency and assume the account
// currency matches it, so the figure is shown directly in dollars.

export type TradeDirection = "buy" | "sell";

export interface ForexProfitInput {
  direction: TradeDirection;
  lots: number; // standard lots
  contractSize: number; // units per lot, usually 100000
  entryPrice: number;
  exitPrice: number;
  pipSize: number; // 0.0001 for most pairs, 0.01 for JPY pairs
}

export interface ForexProfitResult {
  positionUnits: number;
  priceMove: number; // exit minus entry, signed
  pips: number; // pip movement in your favor (signed by direction)
  profit: number; // total profit or loss in quote currency
  returnPerLot: number; // profit per standard lot
}

export function computeForexProfit(input: ForexProfitInput): ForexProfitResult | null {
  const { direction, lots, contractSize, entryPrice, exitPrice, pipSize } = input;

  if (!Number.isFinite(lots) || lots <= 0) return null;
  if (!Number.isFinite(contractSize) || contractSize <= 0) return null;
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) return null;
  if (!Number.isFinite(exitPrice) || exitPrice < 0) return null;
  if (!Number.isFinite(pipSize) || pipSize <= 0) return null;

  const positionUnits = lots * contractSize;
  const sign = direction === "buy" ? 1 : -1;
  const priceMove = exitPrice - entryPrice;
  const profit = priceMove * sign * positionUnits;
  const pips = (priceMove * sign) / pipSize;
  const returnPerLot = profit / lots;

  return { positionUnits, priceMove, pips, profit, returnPerLot };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatPips(n: number): string {
  if (!Number.isFinite(n)) return "0.0";
  return n.toFixed(1);
}
