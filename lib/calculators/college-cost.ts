// Pure logic for the College Cost Calculator.
// Projects the future cost of attending college, growing today's annual cost by
// an education inflation rate up to the year the student enrolls, then summing
// the inflated cost across each year of study.
//
//   Cost in year k = currentAnnualCost x (1 + inflation)^(yearsUntilStart + k)
//   Total = sum of the cost across all years of study

export interface CollegeCostInput {
  currentAnnualCost: number; // today's all-in cost for one year
  yearsUntilStart: number; // years until the student begins college
  yearsOfStudy: number; // number of years the degree takes
  inflationRatePct: number; // annual education cost inflation
}

export interface CollegeCostYearPoint {
  /** Study year number, 1 based. */
  studyYear: number;
  /** Years from today this cost is incurred. */
  yearFromNow: number;
  /** Inflated cost for that single year of study. */
  yearCost: number;
  /** Running total cost through this year of study. */
  cumulative: number;
}

export interface CollegeCostResult {
  costAtEnrollment: number; // inflated cost of the first year of college
  totalCost: number; // total cost across all years of study
  totalInToday: number; // total expressed in today's dollars at current cost
  inflationImpact: number; // totalCost minus totalInToday
  schedule: CollegeCostYearPoint[];
}

export function computeCollegeCost(input: CollegeCostInput): CollegeCostResult | null {
  const { currentAnnualCost, yearsUntilStart, yearsOfStudy, inflationRatePct } = input;

  if (!Number.isFinite(currentAnnualCost) || currentAnnualCost <= 0) return null;
  if (!Number.isFinite(yearsUntilStart) || yearsUntilStart < 0) return null;
  if (!Number.isFinite(yearsOfStudy) || yearsOfStudy <= 0) return null;
  if (!Number.isFinite(inflationRatePct) || inflationRatePct < 0) return null;

  const inflation = inflationRatePct / 100;
  const study = Math.round(yearsOfStudy);

  let totalCost = 0;
  let cumulative = 0;
  const schedule: CollegeCostYearPoint[] = [];

  for (let k = 0; k < study; k++) {
    const yearFromNow = yearsUntilStart + k;
    const yearCost = currentAnnualCost * Math.pow(1 + inflation, yearFromNow);
    totalCost += yearCost;
    cumulative += yearCost;
    schedule.push({
      studyYear: k + 1,
      yearFromNow,
      yearCost,
      cumulative,
    });
  }

  const costAtEnrollment = currentAnnualCost * Math.pow(1 + inflation, yearsUntilStart);
  const totalInToday = currentAnnualCost * study;
  const inflationImpact = totalCost - totalInToday;

  return { costAtEnrollment, totalCost, totalInToday, inflationImpact, schedule };
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
