// Pure logic for the Mining Profitability Calculator.
// Estimates daily / monthly / yearly crypto mining revenue, electricity cost
// and net profit from your hash rate, the network's block reward economics,
// power draw and electricity price. Produces a cumulative-profit schedule
// (including hardware payback) for charting.

export interface MiningInput {
  hashRate: number; // in the unit selected
  hashUnit: HashUnit; // multiplier vs base hash/s
  powerWatts: number; // rig power draw in watts
  electricityPrice: number; // $ per kWh
  coinPrice: number; // $ per coin
  blockReward: number; // coins per block
  blockTimeSec: number; // seconds per block
  networkHashRate: number; // network hash/s in the same unit family (TH/s assumed by networkUnit)
  networkUnit: HashUnit;
  poolFeePct: number; // pool fee percentage
  hardwareCost: number; // upfront rig cost, for payback
}

export type HashUnit = "H" | "KH" | "MH" | "GH" | "TH" | "PH";

export const HASH_MULTIPLIER: Record<HashUnit, number> = {
  H: 1,
  KH: 1e3,
  MH: 1e6,
  GH: 1e9,
  TH: 1e12,
  PH: 1e15,
};

export interface MiningMonthPoint {
  month: number;
  cumulativeProfit: number; // net profit accumulated, minus hardware cost
}

export interface MiningResult {
  coinsPerDay: number;
  revenuePerDay: number;
  costPerDay: number;
  profitPerDay: number;
  revenuePerMonth: number;
  costPerMonth: number;
  profitPerMonth: number;
  profitPerYear: number;
  marginPct: number;
  breakEvenDays: number | null; // days to recover hardware cost, null if never
  schedule: MiningMonthPoint[];
}

export function computeMining(input: MiningInput): MiningResult | null {
  const {
    hashRate,
    hashUnit,
    powerWatts,
    electricityPrice,
    coinPrice,
    blockReward,
    blockTimeSec,
    networkHashRate,
    networkUnit,
    poolFeePct,
    hardwareCost,
  } = input;

  if (!Number.isFinite(hashRate) || hashRate <= 0) return null;
  if (!Number.isFinite(networkHashRate) || networkHashRate <= 0) return null;
  if (!Number.isFinite(blockTimeSec) || blockTimeSec <= 0) return null;
  if (!Number.isFinite(coinPrice) || coinPrice < 0) return null;
  if (!Number.isFinite(blockReward) || blockReward < 0) return null;
  if (!Number.isFinite(powerWatts) || powerWatts < 0) return null;
  if (!Number.isFinite(electricityPrice) || electricityPrice < 0) return null;
  if (!Number.isFinite(poolFeePct) || poolFeePct < 0 || poolFeePct >= 100) return null;
  if (!Number.isFinite(hardwareCost) || hardwareCost < 0) return null;

  const myHps = hashRate * HASH_MULTIPLIER[hashUnit];
  const netHps = networkHashRate * HASH_MULTIPLIER[networkUnit];

  const share = myHps / netHps; // fraction of network you control
  const blocksPerDay = 86400 / blockTimeSec;
  const grossCoinsPerDay = share * blocksPerDay * blockReward;
  const coinsPerDay = grossCoinsPerDay * (1 - poolFeePct / 100);

  const revenuePerDay = coinsPerDay * coinPrice;
  const kWhPerDay = (powerWatts / 1000) * 24;
  const costPerDay = kWhPerDay * electricityPrice;
  const profitPerDay = revenuePerDay - costPerDay;

  const revenuePerMonth = revenuePerDay * 30.4375;
  const costPerMonth = costPerDay * 30.4375;
  const profitPerMonth = profitPerDay * 30.4375;
  const profitPerYear = profitPerDay * 365;

  const marginPct = revenuePerDay > 0 ? (profitPerDay / revenuePerDay) * 100 : 0;

  const breakEvenDays = profitPerDay > 0 ? hardwareCost / profitPerDay : null;

  const schedule: MiningMonthPoint[] = [{ month: 0, cumulativeProfit: -hardwareCost }];
  for (let m = 1; m <= 24; m++) {
    schedule.push({ month: m, cumulativeProfit: profitPerMonth * m - hardwareCost });
  }

  return {
    coinsPerDay,
    revenuePerDay,
    costPerDay,
    profitPerDay,
    revenuePerMonth,
    costPerMonth,
    profitPerMonth,
    profitPerYear,
    marginPct,
    breakEvenDays,
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
