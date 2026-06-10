// Pure logic for the Crypto Converter.
// Converts an amount from one asset to another using each asset's USD price.
// Works for crypto-to-crypto, crypto-to-fiat and fiat-to-crypto because every
// asset is quoted against USD. Prices are static reference rates the user can
// override; nothing is fetched at render time (keeps output deterministic).

export interface AssetRate {
  symbol: string;
  name: string;
  usd: number; // price of 1 unit in USD
  crypto: boolean;
}

// Reference USD prices. These are editable defaults, not live quotes.
export const ASSETS: AssetRate[] = [
  { symbol: "BTC", name: "Bitcoin", usd: 45000, crypto: true },
  { symbol: "ETH", name: "Ethereum", usd: 2400, crypto: true },
  { symbol: "BNB", name: "BNB", usd: 320, crypto: true },
  { symbol: "SOL", name: "Solana", usd: 110, crypto: true },
  { symbol: "XRP", name: "XRP", usd: 0.55, crypto: true },
  { symbol: "ADA", name: "Cardano", usd: 0.45, crypto: true },
  { symbol: "DOGE", name: "Dogecoin", usd: 0.08, crypto: true },
  { symbol: "USDT", name: "Tether", usd: 1, crypto: true },
  { symbol: "USD", name: "US Dollar", usd: 1, crypto: false },
  { symbol: "EUR", name: "Euro", usd: 1.08, crypto: false },
  { symbol: "GBP", name: "British Pound", usd: 1.27, crypto: false },
];

export interface CryptoConverterInput {
  amount: number;
  fromUsd: number; // USD price of the source asset
  toUsd: number; // USD price of the target asset
}

export interface CryptoConverterResult {
  result: number; // amount expressed in the target asset
  usdValue: number; // value of the input amount in USD
  rate: number; // how many target units equal one source unit
  inverseRate: number; // how many source units equal one target unit
}

export function computeCryptoConverter(input: CryptoConverterInput): CryptoConverterResult | null {
  const { amount, fromUsd, toUsd } = input;
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(fromUsd) || fromUsd <= 0) return null;
  if (!Number.isFinite(toUsd) || toUsd <= 0) return null;

  const usdValue = amount * fromUsd;
  const result = usdValue / toUsd;
  const rate = fromUsd / toUsd; // 1 source = rate target
  const inverseRate = toUsd / fromUsd;

  return { result, usdValue, rate, inverseRate };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

// Adaptive number format: more decimals for tiny values, fewer for large ones.
export function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  let max = 2;
  if (abs > 0 && abs < 1) max = 8;
  else if (abs < 100) max = 6;
  else if (abs < 100000) max = 4;
  return n.toLocaleString("en-US", { maximumFractionDigits: max });
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
