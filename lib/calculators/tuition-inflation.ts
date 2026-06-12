// Pure logic for the Tuition Inflation Calculator.
// College costs have historically risen faster than general inflation. This tool
// inflates today's annual tuition forward to the year a child starts college, then
// sums the cost across all years of study, and (optionally) tells you how much you
// would need to save each month to cover that future bill given an expected return
// on savings. A per-year schedule is returned for charting the rising cost curve.

export interface TuitionInflationInput {
  currentAnnualCost: number; // today's annual tuition + fees (and room/board if you want)
  yearsUntilStart: number; // years until the first year of college
  yearsOfStudy: number; // e.g. 4 for a bachelor's degree
  inflationPct: number; // expected annual tuition inflation
  currentSavings: number; // already saved
  savingsReturnPct: number; // expected annual return on what you save
}

export interface TuitionYearPoint {
  year: number; // calendar offset from today (years until that bill is due)
  annualCost: number; // inflated cost of that single academic year
  cumulativeCost: number; // running total of college bills up to and including this year
}

export interface TuitionInflationResult {
  firstYearCost: number; // inflated cost of the first year of college
  totalCost: number; // total cost across all years of study
  costInTodaysDollars: number; // total college cost, all years, at today's prices
  monthlySavingsNeeded: number; // required monthly contribution to fully fund the bill
  futureValueOfCurrentSavings: number;
  schedule: TuitionYearPoint[];
}

export function computeTuitionInflation(input: TuitionInflationInput): TuitionInflationResult | null {
  const {
    currentAnnualCost,
    yearsUntilStart,
    yearsOfStudy,
    inflationPct,
    currentSavings,
    savingsReturnPct,
  } = input;

  if (!Number.isFinite(currentAnnualCost) || currentAnnualCost < 0) return null;
  if (!Number.isFinite(yearsUntilStart) || yearsUntilStart < 0) return null;
  if (!Number.isFinite(yearsOfStudy) || yearsOfStudy < 1) return null;
  if (!Number.isFinite(inflationPct)) return null;
  if (currentSavings < 0) return null;

  const g = inflationPct / 100;
  const years = Math.round(yearsOfStudy);

  const schedule: TuitionYearPoint[] = [];
  let totalCost = 0;
  let firstYearCost = 0;

  for (let i = 0; i < years; i++) {
    // The bill for academic year i is due (yearsUntilStart + i) years from now.
    const offset = yearsUntilStart + i;
    const annualCost = currentAnnualCost * Math.pow(1 + g, offset);
    if (i === 0) firstYearCost = annualCost;
    totalCost += annualCost;
    schedule.push({ year: offset, annualCost, cumulativeCost: totalCost });
  }

  const costInTodaysDollars = currentAnnualCost * years;

  // Grow current savings to the *start* of college (when the first bill is due).
  const rr = savingsReturnPct / 100;
  const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + rr, yearsUntilStart);

  // Amount that still needs to be funded by monthly contributions, discounted /
  // accumulated to the start date. Use a sinking-fund (future value of annuity)
  // calculation over the months until college begins.
  const gap = Math.max(0, totalCost - futureValueOfCurrentSavings);
  const months = Math.max(1, Math.round(yearsUntilStart * 12));
  const monthlyRate = Math.pow(1 + rr, 1 / 12) - 1;

  let monthlySavingsNeeded: number;
  if (monthlyRate <= 0) {
    monthlySavingsNeeded = gap / months;
  } else {
    const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    monthlySavingsNeeded = gap / annuityFactor;
  }

  return {
    firstYearCost,
    totalCost,
    costInTodaysDollars,
    monthlySavingsNeeded,
    futureValueOfCurrentSavings,
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
