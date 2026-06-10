// Pure logic for the Crypto DCA (Dollar-Cost Averaging) Calculator.
// Simulates buying a fixed dollar amount of a coin at a regular interval while
// the price drifts (a constant CAGR plus a deterministic wobble for the chart).
// Each buy adds coins = contribution / price at that period. Exposes a per-period
// schedule for plotting invested vs portfolio value.

export type Interval = "daily" | "weekly" | "biweekly" | "monthly";

export const PERIODS_PER_YEAR: Record<Interval, number> = {
  daily: 365,
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export interface CryptoDcaInput {
  contribution: number; // dollars per buy
  interval: Interval;
  years: number;
  startPrice: number; // price of the coin at the first buy
  annualGrowthPct: number; // expected average annual price change
}

export interface DcaPoint {
  period: number; // period index (0-based marker at year boundaries)
  year: number;
  invested: number; // cumulative dollars contributed
  coins: number; // cumulative coins held
  value: number; // coins times current price
  price: number;
}

export interface CryptoDcaResult {
  totalInvested: number;
  coinsHeld: number;
  finalPrice: number;
  finalValue: number;
  profit: number;
  roiPct: number;
  averageCost: number; // average price paid per coin
  buys: number;
  schedule: DcaPoint[];
}

// Deterministic seasonal wobble so the chart looks like a real price path
// without using Math.random (which would break hydration / SSR consistency).
function wobble(t: number): number {
  return 1 + 0.12 * Math.sin(t * 2.3) + 0.06 * Math.sin(t * 5.7);
}

export function computeCryptoDca(input: CryptoDcaInput): CryptoDcaResult | null {
  const { contribution, interval, years, startPrice, annualGrowthPct } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(contribution) || contribution <= 0) return null;
  if (!Number.isFinite(startPrice) || startPrice <= 0) return null;
  if (!Number.isFinite(annualGrowthPct)) return null;

  const perYear = PERIODS_PER_YEAR[interval];
  const buys = Math.max(1, Math.round(years * perYear));
  const g = annualGrowthPct / 100;
  const perPeriodGrowth = Math.pow(1 + g, 1 / perYear) - 1;

  let coins = 0;
  let invested = 0;
  let price = startPrice;
  let lastValue = 0;

  const schedule: DcaPoint[] = [
    { period: 0, year: 0, invested: 0, coins: 0, value: 0, price: startPrice },
  ];

  // Mark roughly 60 points (or every period if fewer) for a smooth chart.
  const markEvery = Math.max(1, Math.floor(buys / 60));

  for (let i = 1; i <= buys; i++) {
    const trend = startPrice * Math.pow(1 + perPeriodGrowth, i);
    price = trend * wobble(i / perYear);
    coins += contribution / price;
    invested += contribution;
    lastValue = coins * price;

    if (i % markEvery === 0 || i === buys) {
      schedule.push({
        period: i,
        year: i / perYear,
        invested,
        coins,
        value: lastValue,
        price,
      });
    }
  }

  const finalPrice = price;
  const finalValue = coins * finalPrice;
  const profit = finalValue - invested;
  const roiPct = invested > 0 ? (profit / invested) * 100 : 0;
  const averageCost = coins > 0 ? invested / coins : 0;

  return {
    totalInvested: invested,
    coinsHeld: coins,
    finalPrice,
    finalValue,
    profit,
    roiPct,
    averageCost,
    buys,
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
