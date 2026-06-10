// Pure logic for the Forex Position Size Calculator.
// Works out how large a trade can be so that hitting the stop loss costs no more
// than a chosen percentage of the account. For forex, position size is expressed
// in lots, where 1 standard lot = 100,000 units of the base currency and the pip
// value depends on the quote currency (assumed USD-denominated account here).

export interface PositionSizeInput {
  accountBalance: number;
  riskPercent: number; // percent of account to risk on this trade
  stopLossPips: number; // distance to stop in pips
  pipValuePerLot: number; // dollar value of one pip for one standard lot (e.g. 10 for USD quote)
}

export interface PositionSizeResult {
  riskAmount: number; // dollars at risk
  lots: number; // standard lots
  units: number; // base-currency units
  miniLots: number;
  microLots: number;
  riskPerLot: number; // dollar loss per standard lot if stop is hit
  marginNote: number; // dollars risked re-expressed as % (echo of input, for the panel)
}

const UNITS_PER_LOT = 100_000;

export function computePositionSize(input: PositionSizeInput): PositionSizeResult | null {
  const { accountBalance, riskPercent, stopLossPips, pipValuePerLot } = input;

  if (!Number.isFinite(accountBalance) || accountBalance <= 0) return null;
  if (!Number.isFinite(riskPercent) || riskPercent <= 0) return null;
  if (!Number.isFinite(stopLossPips) || stopLossPips <= 0) return null;
  if (!Number.isFinite(pipValuePerLot) || pipValuePerLot <= 0) return null;

  const riskAmount = accountBalance * (riskPercent / 100);
  // Loss per standard lot if the stop is hit.
  const riskPerLot = stopLossPips * pipValuePerLot;
  const lots = riskAmount / riskPerLot;
  const units = lots * UNITS_PER_LOT;

  return {
    riskAmount,
    lots,
    units,
    miniLots: lots * 10,
    microLots: lots * 100,
    riskPerLot,
    marginNote: riskPercent,
  };
}

// For charting: how lots scale as the stop-loss distance changes, holding risk fixed.
export interface PositionSizeCurvePoint {
  pips: number;
  lots: number;
}

export function buildStopCurve(
  riskAmount: number,
  pipValuePerLot: number,
  maxPips: number
): PositionSizeCurvePoint[] {
  if (!Number.isFinite(riskAmount) || riskAmount <= 0) return [];
  if (!Number.isFinite(pipValuePerLot) || pipValuePerLot <= 0) return [];
  const hi = Math.max(10, Math.round(maxPips * 2));
  const points: PositionSizeCurvePoint[] = [];
  const steps = 40;
  for (let s = 1; s <= steps; s++) {
    const pips = (hi / steps) * s;
    const lots = riskAmount / (pips * pipValuePerLot);
    points.push({ pips, lots });
  }
  return points;
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
