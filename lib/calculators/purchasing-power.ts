// Pure logic for the Purchasing Power Calculator.
// Shows how inflation erodes the real value of a fixed amount of money over
// time. Given a starting amount and an average annual inflation rate, it
// computes the future nominal amount needed to keep the same buying power and
// the real value of today's money in the future, plus a year-by-year schedule.

export interface PurchasingPowerInput {
  amount: number; // amount of money today
  inflationPct: number; // average annual inflation rate
  years: number; // horizon in years
}

export interface PurchasingPowerYearPoint {
  year: number;
  realValue: number; // what today's "amount" is worth then, in today's dollars
  equivalentNeeded: number; // nominal money needed then to match today's amount
  cumulativeInflationPct: number; // total price increase since year 0
}

export interface PurchasingPowerResult {
  realValue: number; // future buying power of "amount" in today's dollars
  equivalentNeeded: number; // future dollars needed to match today's amount
  lostValue: number; // amount minus realValue
  totalInflationPct: number; // cumulative price rise over the whole horizon
  schedule: PurchasingPowerYearPoint[];
}

export function computePurchasingPower(
  input: PurchasingPowerInput
): PurchasingPowerResult | null {
  const { amount, inflationPct, years } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(inflationPct)) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const i = inflationPct / 100;
  const n = Math.round(years);

  const schedule: PurchasingPowerYearPoint[] = [
    { year: 0, realValue: amount, equivalentNeeded: amount, cumulativeInflationPct: 0 },
  ];

  for (let yr = 1; yr <= n; yr++) {
    const factor = Math.pow(1 + i, yr);
    const realValue = amount / factor; // discount today's amount by inflation
    const equivalentNeeded = amount * factor; // inflate today's amount forward
    schedule.push({
      year: yr,
      realValue,
      equivalentNeeded,
      cumulativeInflationPct: (factor - 1) * 100,
    });
  }

  const last = schedule[schedule.length - 1];
  const realValue = last.realValue;
  const equivalentNeeded = last.equivalentNeeded;
  const lostValue = amount - realValue;
  const totalInflationPct = last.cumulativeInflationPct;

  return { realValue, equivalentNeeded, lostValue, totalInflationPct, schedule };
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
