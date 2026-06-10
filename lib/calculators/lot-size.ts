// Pure logic for the Lot Size Calculator (forex position sizing).
// Works out how large a trade you can take so that, if the stop loss is hit,
// the loss equals a chosen percentage of the account. Sizes are returned in
// units, micro/mini/standard lots and the cash value risked.

export interface LotSizeInput {
  accountBalance: number;
  riskPercent: number; // percent of the account risked on the trade
  stopLossPips: number; // distance to stop in pips
  pipValuePerLot: number; // cash value of one pip for one standard lot (e.g. $10 for EURUSD)
}

export interface LotSizeResult {
  riskAmount: number; // cash at risk
  standardLots: number;
  miniLots: number;
  microLots: number;
  units: number; // 1 standard lot = 100,000 units
  pipValuePerStandardLot: number;
  lossAtStop: number; // cash lost if stop is hit at the rounded size
  schedule: { riskPct: number; lots: number; risk: number }[];
}

const UNITS_PER_STANDARD_LOT = 100_000;

export function computeLotSize(input: LotSizeInput): LotSizeResult | null {
  const { accountBalance, riskPercent, stopLossPips, pipValuePerLot } = input;

  if (!Number.isFinite(accountBalance) || accountBalance <= 0) return null;
  if (!Number.isFinite(riskPercent) || riskPercent <= 0) return null;
  if (!Number.isFinite(stopLossPips) || stopLossPips <= 0) return null;
  if (!Number.isFinite(pipValuePerLot) || pipValuePerLot <= 0) return null;

  const riskAmount = accountBalance * (riskPercent / 100);

  // Loss per standard lot if the stop is hit.
  const lossPerStandardLot = stopLossPips * pipValuePerLot;
  const standardLots = riskAmount / lossPerStandardLot;

  const units = standardLots * UNITS_PER_STANDARD_LOT;
  const lossAtStop = standardLots * lossPerStandardLot;

  // Comparison schedule across common risk levels for a quick visual.
  const riskLevels = [0.5, 1, 2, 3, 5];
  const schedule = riskLevels.map((pct) => {
    const risk = accountBalance * (pct / 100);
    return { riskPct: pct, lots: risk / lossPerStandardLot, risk };
  });

  return {
    riskAmount,
    standardLots,
    miniLots: standardLots * 10,
    microLots: standardLots * 100,
    units,
    pipValuePerStandardLot: pipValuePerLot,
    lossAtStop,
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

const lots = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
export const formatLots = (n: number) => (Number.isFinite(n) ? lots.format(n) : "0");
