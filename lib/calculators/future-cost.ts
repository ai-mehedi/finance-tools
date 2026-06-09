// Pure logic for the Future Cost Calculator.
// Projects how much something that costs P today will cost after t years of
// price inflation at an average annual rate: Future cost = P * (1 + r)^t.
// Exposes a per-year schedule so the rising cost can be charted.

export interface FutureCostInput {
  currentCost: number;
  annualInflationPct: number;
  years: number;
}

export interface FutureCostYearPoint {
  year: number;
  cost: number;
}

export interface FutureCostResult {
  futureCost: number;
  totalIncrease: number; // future cost minus today's cost
  multiple: number; // future cost divided by today's cost
  schedule: FutureCostYearPoint[];
}

export function computeFutureCost(input: FutureCostInput): FutureCostResult | null {
  const { currentCost, annualInflationPct, years } = input;

  if (!Number.isFinite(currentCost) || currentCost < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualInflationPct) || annualInflationPct < -100) return null;

  const r = annualInflationPct / 100;
  const wholeYears = Math.floor(years);

  const schedule: FutureCostYearPoint[] = [{ year: 0, cost: currentCost }];
  for (let y = 1; y <= wholeYears; y++) {
    schedule.push({ year: y, cost: currentCost * Math.pow(1 + r, y) });
  }
  if (years > wholeYears) {
    schedule.push({ year: years, cost: currentCost * Math.pow(1 + r, years) });
  }

  const futureCost = currentCost * Math.pow(1 + r, years);
  const totalIncrease = futureCost - currentCost;
  const multiple = currentCost > 0 ? futureCost / currentCost : 0;

  return { futureCost, totalIncrease, multiple, schedule };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
