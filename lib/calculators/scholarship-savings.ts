// Pure logic for the Scholarship Savings Calculator.
// Projects how much of a future college bill a family will have covered by the
// time a child starts school, by growing a starting balance plus monthly savings
// at an assumed return, while the target cost itself inflates each year. The gap
// between the projected savings and the inflated cost is the shortfall that
// scholarships, grants, work or loans would need to fill.

export type Compounding = "annually" | "quarterly" | "monthly";

export const COMPOUND_PER_YEAR: Record<Compounding, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
};

export interface ScholarshipSavingsInput {
  currentSavings: number;
  monthlySaving: number;
  annualReturnPct: number;
  yearsUntilCollege: number;
  annualCostToday: number;
  costInflationPct: number;
  yearsOfStudy: number;
  expectedScholarshipPct: number; // share of total cost expected from scholarships/grants
  compounding: Compounding;
}

export interface ScholarshipYearPoint {
  year: number;
  savings: number; // projected savings balance at the start of that year
  contributed: number; // current savings plus deposits made so far
}

export interface ScholarshipSavingsResult {
  projectedSavings: number; // balance when college begins
  totalContributions: number; // deposits only, excludes starting balance
  totalGrowth: number; // investment earnings
  totalCost: number; // full inflated multi-year cost of attendance
  scholarshipCover: number; // dollars expected from scholarships/grants
  netCost: number; // cost after scholarships
  covered: number; // dollars of net cost met by savings
  shortfall: number; // dollars still unfunded (0 if fully funded)
  coveragePct: number; // percent of net cost met by savings (capped at 100)
  schedule: ScholarshipYearPoint[];
}

export function computeScholarshipSavings(
  input: ScholarshipSavingsInput
): ScholarshipSavingsResult | null {
  const {
    currentSavings,
    monthlySaving,
    annualReturnPct,
    yearsUntilCollege,
    annualCostToday,
    costInflationPct,
    yearsOfStudy,
    expectedScholarshipPct,
    compounding,
  } = input;

  if (!Number.isFinite(yearsUntilCollege) || yearsUntilCollege < 0) return null;
  if (!Number.isFinite(yearsOfStudy) || yearsOfStudy <= 0) return null;
  if (currentSavings < 0 || monthlySaving < 0 || annualCostToday < 0) return null;
  if (!Number.isFinite(annualReturnPct) || !Number.isFinite(costInflationPct)) return null;
  if (expectedScholarshipPct < 0 || expectedScholarshipPct > 100) return null;

  const n = COMPOUND_PER_YEAR[compounding];
  const r = annualReturnPct / 100;
  // Effective monthly growth rate equivalent to the nominal annual rate.
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  const months = Math.round(yearsUntilCollege * 12);
  let balance = currentSavings;

  const schedule: ScholarshipYearPoint[] = [
    { year: 0, savings: currentSavings, contributed: currentSavings },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlySaving;
    if (m % 12 === 0) {
      schedule.push({
        year: m / 12,
        savings: balance,
        contributed: currentSavings + monthlySaving * m,
      });
    }
  }

  const projectedSavings = balance;
  const totalContributions = monthlySaving * months;
  const totalGrowth = projectedSavings - currentSavings - totalContributions;

  // Inflate the cost of attendance to the year college begins, then sum each
  // year of study, letting the cost keep rising while the student is enrolled.
  const g = costInflationPct / 100;
  let totalCost = 0;
  for (let s = 0; s < yearsOfStudy; s++) {
    const yearOfThatBill = yearsUntilCollege + s;
    totalCost += annualCostToday * Math.pow(1 + g, yearOfThatBill);
  }

  const scholarshipCover = totalCost * (expectedScholarshipPct / 100);
  const netCost = Math.max(0, totalCost - scholarshipCover);
  const covered = Math.min(projectedSavings, netCost);
  const shortfall = Math.max(0, netCost - projectedSavings);
  const coveragePct = netCost > 0 ? Math.min(100, (projectedSavings / netCost) * 100) : 100;

  return {
    projectedSavings,
    totalContributions,
    totalGrowth,
    totalCost,
    scholarshipCover,
    netCost,
    covered,
    shortfall,
    coveragePct,
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
