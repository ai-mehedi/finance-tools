// Pure logic for the Real Interest Rate Calculator.
// The real interest rate is the nominal rate adjusted for inflation: it is
// what your money actually earns in purchasing power. The exact relationship
// (the Fisher equation) is:
//   1 + real = (1 + nominal) / (1 + inflation)
// The common approximation real ~= nominal - inflation is also reported so
// the two can be compared. A per-year schedule of real purchasing power is
// exposed for charting.

export interface RealInterestInput {
  nominalRatePct: number; // stated/nominal annual interest rate
  inflationRatePct: number; // expected annual inflation rate
  principal: number; // amount used to illustrate real growth
  years: number; // horizon for the projection
}

export interface RealInterestYearPoint {
  year: number;
  nominalValue: number; // balance growing at the nominal rate
  realValue: number; // balance in today's purchasing power
}

export interface RealInterestResult {
  realRatePct: number; // exact Fisher real rate, as a percent
  approxRealRatePct: number; // simple nominal minus inflation, as a percent
  nominalEndValue: number; // principal grown at the nominal rate
  realEndValue: number; // ending value in today's dollars
  purchasingPowerLoss: number; // nominal end value minus real end value
  schedule: RealInterestYearPoint[];
}

export function computeRealInterestRate(input: RealInterestInput): RealInterestResult | null {
  const { nominalRatePct, inflationRatePct, principal, years } = input;

  if (!Number.isFinite(nominalRatePct)) return null;
  if (!Number.isFinite(inflationRatePct) || inflationRatePct <= -100) return null;
  if (!Number.isFinite(principal) || principal < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const nominal = nominalRatePct / 100;
  const inflation = inflationRatePct / 100;

  // Fisher equation: exact real rate.
  const real = (1 + nominal) / (1 + inflation) - 1;
  const realRatePct = real * 100;
  const approxRealRatePct = nominalRatePct - inflationRatePct;

  const span = Math.min(Math.round(years), 80);

  const schedule: RealInterestYearPoint[] = [
    { year: 0, nominalValue: principal, realValue: principal },
  ];

  for (let yr = 1; yr <= span; yr++) {
    const nominalValue = principal * Math.pow(1 + nominal, yr);
    const realValue = nominalValue / Math.pow(1 + inflation, yr);
    schedule.push({ year: yr, nominalValue, realValue });
  }

  const last = schedule[schedule.length - 1];
  const nominalEndValue = last.nominalValue;
  const realEndValue = last.realValue;
  const purchasingPowerLoss = nominalEndValue - realEndValue;

  return {
    realRatePct,
    approxRealRatePct,
    nominalEndValue,
    realEndValue,
    purchasingPowerLoss,
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
