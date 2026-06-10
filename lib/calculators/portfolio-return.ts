// Pure logic for the Portfolio Return Calculator.
// Takes a set of holdings, each with an amount invested and its own return over
// the period, and computes the blended portfolio return. The portfolio return is
// the value-weighted average of the individual returns, which also equals the
// total ending value divided by the total invested. Optionally annualizes the
// result over a holding period and exposes a per-holding contribution breakdown
// for charting.

export interface Holding {
  name: string;
  amount: number; // amount invested in this holding
  returnPct: number; // simple return over the whole period, in percent
}

export interface PortfolioReturnInput {
  holdings: Holding[];
  years: number; // holding period used for annualizing; 1 means no annualizing
}

export interface HoldingPoint {
  name: string;
  amount: number;
  weight: number; // share of the portfolio, 0..1
  returnPct: number;
  gain: number; // amount * returnPct / 100
  contributionPct: number; // weight * returnPct, in percentage points
}

export interface PortfolioReturnResult {
  totalInvested: number;
  endingValue: number;
  totalGain: number;
  totalReturnPct: number; // simple return over the period
  annualizedReturnPct: number; // compound annual growth rate
  schedule: HoldingPoint[];
}

export function computePortfolioReturn(
  input: PortfolioReturnInput
): PortfolioReturnResult | null {
  const { holdings, years } = input;

  if (!holdings || holdings.length === 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  let totalInvested = 0;
  for (const h of holdings) {
    if (!Number.isFinite(h.amount) || h.amount < 0) return null;
    if (!Number.isFinite(h.returnPct)) return null;
    totalInvested += h.amount;
  }
  if (totalInvested <= 0) return null;

  let endingValue = 0;
  const schedule: HoldingPoint[] = holdings.map((h) => {
    const gain = (h.amount * h.returnPct) / 100;
    const weight = h.amount / totalInvested;
    endingValue += h.amount + gain;
    return {
      name: h.name,
      amount: h.amount,
      weight,
      returnPct: h.returnPct,
      gain,
      contributionPct: weight * h.returnPct,
    };
  });

  const totalGain = endingValue - totalInvested;
  const totalReturnPct = (totalGain / totalInvested) * 100;
  const growth = endingValue / totalInvested;
  const annualizedReturnPct = (Math.pow(growth, 1 / years) - 1) * 100;

  return {
    totalInvested,
    endingValue,
    totalGain,
    totalReturnPct,
    annualizedReturnPct,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) =>
  `${Number.isFinite(n) ? n.toFixed(2) : "0.00"}%`;

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
