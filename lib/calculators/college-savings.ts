// Pure logic for the College Savings Calculator.
// Projects the future cost of a college education (inflated annually) and the
// balance of a 529-style savings plan funded by a starting amount plus monthly
// contributions. Simulates month by month until enrollment and reports any gap
// or surplus, with a per-year schedule for charting savings versus the goal.

export interface CollegeSavingsInput {
  currentSavings: number; // amount already saved
  monthlyContribution: number; // recurring deposit
  annualReturnPct: number; // expected investment return on the plan
  currentAnnualCost: number; // today's cost for one year of college
  costInflationPct: number; // how fast college costs rise each year
  yearsUntilCollege: number; // years until enrollment
  yearsInCollege: number; // duration of the program
}

export interface CollegeSavingsYearPoint {
  year: number; // years from now
  balance: number; // projected plan balance
  contributed: number; // current savings plus deposits so far
  projectedGoal: number; // inflated total cost as of enrollment (constant line)
}

export interface CollegeSavingsResult {
  futureBalance: number; // plan balance at enrollment
  totalCost: number; // inflated total cost across all years in college
  totalContributions: number; // deposits only (excludes starting savings)
  totalGrowth: number; // investment earnings
  gap: number; // totalCost minus futureBalance (positive => shortfall)
  fundedPct: number; // futureBalance / totalCost
  requiredMonthly: number; // monthly deposit needed to fully fund the goal
  schedule: CollegeSavingsYearPoint[];
}

function futureBalanceOf(
  start: number,
  monthly: number,
  monthlyRate: number,
  months: number,
): number {
  let balance = start;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
  }
  return balance;
}

export function computeCollegeSavings(input: CollegeSavingsInput): CollegeSavingsResult | null {
  const {
    currentSavings,
    monthlyContribution,
    annualReturnPct,
    currentAnnualCost,
    costInflationPct,
    yearsUntilCollege,
    yearsInCollege,
  } = input;

  if (!Number.isFinite(yearsUntilCollege) || yearsUntilCollege < 0) return null;
  if (!Number.isFinite(yearsInCollege) || yearsInCollege <= 0) return null;
  if (currentSavings < 0 || monthlyContribution < 0 || currentAnnualCost < 0) return null;
  if (![annualReturnPct, costInflationPct].every((v) => Number.isFinite(v))) return null;

  const monthlyRate = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
  const infl = costInflationPct / 100;

  // Total inflated cost: each year of college occurs at a different future point.
  let totalCost = 0;
  for (let i = 0; i < Math.round(yearsInCollege); i++) {
    const yearOffset = yearsUntilCollege + i;
    totalCost += currentAnnualCost * Math.pow(1 + infl, yearOffset);
  }

  const months = Math.round(yearsUntilCollege * 12);
  const futureBalance = futureBalanceOf(
    currentSavings,
    monthlyContribution,
    monthlyRate,
    months,
  );

  const totalContributions = monthlyContribution * months;
  const totalGrowth = futureBalance - currentSavings - totalContributions;
  const gap = totalCost - futureBalance;
  const fundedPct = totalCost > 0 ? futureBalance / totalCost : 1;

  // Monthly deposit required so the plan exactly meets the goal.
  // Solve: currentSavings*(1+i)^N + PMT * [((1+i)^N - 1)/i] = totalCost
  let requiredMonthly: number;
  if (months <= 0) {
    requiredMonthly = 0;
  } else if (Math.abs(monthlyRate) < 1e-9) {
    requiredMonthly = (totalCost - currentSavings) / months;
  } else {
    const growth = Math.pow(1 + monthlyRate, months);
    const annuityFactor = (growth - 1) / monthlyRate;
    requiredMonthly = (totalCost - currentSavings * growth) / annuityFactor;
  }
  requiredMonthly = Math.max(0, requiredMonthly);

  // Per-year schedule.
  const schedule: CollegeSavingsYearPoint[] = [
    {
      year: 0,
      balance: currentSavings,
      contributed: currentSavings,
      projectedGoal: totalCost,
    },
  ];
  for (let m = 1; m <= months; m++) {
    if (m % 12 === 0) {
      const bal = futureBalanceOf(currentSavings, monthlyContribution, monthlyRate, m);
      schedule.push({
        year: m / 12,
        balance: bal,
        contributed: currentSavings + monthlyContribution * m,
        projectedGoal: totalCost,
      });
    }
  }
  // Ensure the final partial year (if any) is captured at enrollment.
  if (months > 0 && months % 12 !== 0) {
    schedule.push({
      year: yearsUntilCollege,
      balance: futureBalance,
      contributed: currentSavings + totalContributions,
      projectedGoal: totalCost,
    });
  }

  return {
    futureBalance,
    totalCost,
    totalContributions,
    totalGrowth,
    gap,
    fundedPct,
    requiredMonthly,
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
