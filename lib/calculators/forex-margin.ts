// Pure logic for the Forex Margin Calculator.
// Required margin is the slice of your own capital a broker locks up to open a
// leveraged position. Margin = (lots * contract size * price) / leverage, in the
// quote currency. We assume the account currency matches the quote currency so the
// result is shown directly in dollars.

export interface ForexMarginInput {
  lots: number; // number of standard lots (1 lot = contract size units)
  contractSize: number; // units per standard lot, usually 100000
  price: number; // current price of the pair (quote per 1 base unit)
  leverage: number; // e.g. 100 for 100:1
}

export interface ForexMarginResult {
  positionUnits: number; // total base units traded
  notionalValue: number; // full value of the position in quote currency
  requiredMargin: number; // margin you must put up
  marginPercent: number; // 1 / leverage, as a percent
}

export function computeForexMargin(input: ForexMarginInput): ForexMarginResult | null {
  const { lots, contractSize, price, leverage } = input;

  if (!Number.isFinite(lots) || lots <= 0) return null;
  if (!Number.isFinite(contractSize) || contractSize <= 0) return null;
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(leverage) || leverage <= 0) return null;

  const positionUnits = lots * contractSize;
  const notionalValue = positionUnits * price;
  const requiredMargin = notionalValue / leverage;
  const marginPercent = (1 / leverage) * 100;

  return { positionUnits, notionalValue, requiredMargin, marginPercent };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
export const formatUSD0 = (n: number) => usd0.format(Number.isFinite(n) ? n : 0);
