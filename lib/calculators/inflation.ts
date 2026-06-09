// Pure logic for the Inflation Calculator.
// Projects how the buying power of an amount of money changes over time at a
// given annual inflation rate, and exposes a per-year schedule for charting.
// Future nominal cost of today's basket: FV = PV * (1 + i)^t.
// Future buying power of today's money: PV / (1 + i)^t.

export interface InflationInput {
  amount: number; // amount in today's dollars
  annualRatePct: number; // average annual inflation rate
  years: number;
}

export interface InflationYearPoint {
  year: number;
  futureCost: number; // what today's basket costs in that year
  buyingPower: number; // what today's amount is worth in that year
}

export interface InflationResult {
  amount: number;
  futureCost: number; // cost in `years` of what costs `amount` today
  buyingPower: number; // value of `amount` after `years` of inflation
  lostValue: number; // amount - buyingPower
  totalInflationPct: number; // cumulative inflation over the period
  schedule: InflationYearPoint[];
}

export function computeInflation(input: InflationInput): InflationResult | null {
  const { amount, annualRatePct, years } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const i = annualRatePct / 100;
  const wholeYears = Math.max(1, Math.round(years));

  const schedule: InflationYearPoint[] = [
    { year: 0, futureCost: amount, buyingPower: amount },
  ];

  for (let y = 1; y <= wholeYears; y++) {
    const factor = Math.pow(1 + i, y);
    schedule.push({
      year: y,
      futureCost: amount * factor,
      buyingPower: amount / factor,
    });
  }

  const factor = Math.pow(1 + i, years);
  const futureCost = amount * factor;
  const buyingPower = amount / factor;
  const lostValue = amount - buyingPower;
  const totalInflationPct = (factor - 1) * 100;

  return {
    amount,
    futureCost,
    buyingPower,
    lostValue,
    totalInflationPct,
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
