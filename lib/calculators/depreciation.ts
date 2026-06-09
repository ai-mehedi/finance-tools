// Pure logic for the Depreciation Calculator.
// Supports two common methods:
//   - Straight line: equal expense each year = (cost - salvage) / life.
//   - Declining balance: a fixed rate applied to the remaining book value,
//     where double declining uses rate = 2 / life. Depreciation stops at
//     the salvage value.
// Exposes a per-year schedule for charting book value over time.

export type DepreciationMethod = "straight-line" | "declining-balance";

export interface DepreciationInput {
  cost: number;
  salvage: number;
  usefulLifeYears: number;
  method: DepreciationMethod;
  /** Factor for declining balance: 2 = double declining, 1.5 = 150%. */
  factor: number;
}

export interface DepreciationYearPoint {
  year: number;
  depreciation: number; // expense for this year
  accumulated: number; // total depreciation by end of year
  bookValue: number; // remaining value at end of year
}

export interface DepreciationResult {
  totalDepreciation: number;
  firstYearDepreciation: number;
  averageAnnual: number;
  endingBookValue: number;
  schedule: DepreciationYearPoint[]; // includes year 0 (purchase)
}

export function computeDepreciation(input: DepreciationInput): DepreciationResult | null {
  const { cost, salvage, usefulLifeYears, method, factor } = input;

  if (!Number.isFinite(cost) || cost <= 0) return null;
  if (!Number.isFinite(salvage) || salvage < 0) return null;
  if (salvage > cost) return null;
  if (!Number.isFinite(usefulLifeYears) || usefulLifeYears <= 0) return null;
  if (!Number.isFinite(factor) || factor <= 0) return null;

  const life = Math.round(usefulLifeYears);
  const depreciableBase = cost - salvage;

  const schedule: DepreciationYearPoint[] = [
    { year: 0, depreciation: 0, accumulated: 0, bookValue: cost },
  ];

  let bookValue = cost;
  let accumulated = 0;

  if (method === "straight-line") {
    const perYear = depreciableBase / life;
    for (let y = 1; y <= life; y++) {
      const dep = perYear;
      accumulated += dep;
      bookValue = Math.max(salvage, cost - accumulated);
      schedule.push({ year: y, depreciation: dep, accumulated, bookValue });
    }
  } else {
    const rate = factor / life;
    for (let y = 1; y <= life; y++) {
      // Cannot depreciate below salvage value.
      let dep = bookValue * rate;
      if (bookValue - dep < salvage) dep = bookValue - salvage;
      if (dep < 0) dep = 0;
      accumulated += dep;
      bookValue = bookValue - dep;
      schedule.push({ year: y, depreciation: dep, accumulated, bookValue });
    }
  }

  const totalDepreciation = accumulated;
  const firstYearDepreciation = schedule[1] ? schedule[1].depreciation : 0;
  const averageAnnual = totalDepreciation / life;
  const endingBookValue = bookValue;

  return {
    totalDepreciation,
    firstYearDepreciation,
    averageAnnual,
    endingBookValue,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
