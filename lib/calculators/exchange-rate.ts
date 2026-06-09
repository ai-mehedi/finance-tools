// Pure logic for the Exchange Rate Calculator.
// Converts an amount from one currency to another using a quoted exchange rate,
// with an optional conversion fee expressed as a percentage of the amount.

export interface ExchangeRateInput {
  amount: number;
  rate: number; // units of target currency per 1 unit of source currency
  feePct?: number; // conversion/markup fee as a percent of the amount
}

export interface ExchangeRateResult {
  converted: number; // amount in the target currency before fee
  fee: number; // fee in the target currency
  netConverted: number; // amount received after the fee
  effectiveRate: number; // net target units actually received per source unit
  inverseRate: number; // source units per 1 target unit
}

export function computeExchangeRate(input: ExchangeRateInput): ExchangeRateResult | null {
  const { amount, rate, feePct = 0 } = input;
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(rate) || rate <= 0) return null;
  if (!Number.isFinite(feePct) || feePct < 0) return null;

  const converted = amount * rate;
  const fee = converted * (feePct / 100);
  const netConverted = converted - fee;
  const effectiveRate = amount > 0 ? netConverted / amount : rate;
  const inverseRate = 1 / rate;

  return { converted, fee, netConverted, effectiveRate, inverseRate };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const num = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export const formatNumber = (n: number) => num.format(Number.isFinite(n) ? n : 0);
