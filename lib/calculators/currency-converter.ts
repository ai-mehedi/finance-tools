// Logic for the Currency Converter tool.
// Uses a fixed, indicative reference rate table (units of currency per 1 USD)
// so output is fully deterministic and renders identically on server and client.
// These are static reference values, not live market rates.

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  perUsd: number; // how many units of this currency equal 1 USD
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$", perUsd: 1 },
  { code: "EUR", name: "Euro", symbol: "€", perUsd: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", perUsd: 0.79 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", perUsd: 156 },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", perUsd: 1.37 },
  { code: "AUD", name: "Australian Dollar", symbol: "$", perUsd: 1.51 },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", perUsd: 0.89 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", perUsd: 7.24 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", perUsd: 83.4 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", perUsd: 5.42 },
  { code: "MXN", name: "Mexican Peso", symbol: "$", perUsd: 17.1 },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", perUsd: 1.35 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", perUsd: 3.67 },
  { code: "ZAR", name: "South African Rand", symbol: "R", perUsd: 18.6 },
];

const RATE_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
);

export interface ConvertInput {
  amount: number;
  from: string;
  to: string;
}

export interface ConvertResult {
  converted: number;
  rate: number; // units of "to" per 1 unit of "from"
  fromInfo: CurrencyInfo;
  toInfo: CurrencyInfo;
}

export function convertCurrency(input: ConvertInput): ConvertResult | null {
  const { amount, from, to } = input;
  const fromInfo = RATE_MAP[from];
  const toInfo = RATE_MAP[to];
  if (!fromInfo || !toInfo) return null;
  if (!Number.isFinite(amount) || amount < 0) return null;

  // Convert via USD: amount in USD, then into the target currency.
  const usdValue = amount / fromInfo.perUsd;
  const converted = usdValue * toInfo.perUsd;
  const rate = toInfo.perUsd / fromInfo.perUsd;

  return { converted, rate, fromInfo, toInfo };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const decimal = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal4 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatMoney(n: number, symbol: string): string {
  if (!Number.isFinite(n)) return `${symbol}0.00`;
  return `${symbol}${decimal.format(n)}`;
}

export const formatRate = (n: number) => decimal4.format(Number.isFinite(n) ? n : 0);
