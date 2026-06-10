// Pure logic for the Goal Based Savings Calculator.
// Works out the monthly contribution needed to reach a target amount within a
// set number of years, given an expected annual return on what you save and an
// optional starting balance already set aside. Builds a per-year schedule of
// the projected balance for charting.

export interface GoalSavingsInput {
  goalAmount: number; // target amount to reach
  currentSavings: number; // amount already saved today
  annualRatePct: number; // expected annual return on savings
  years: number; // time horizon to reach the goal
}

export interface GoalYearPoint {
  year: number;
  balance: number;
  contributed: number; // current savings plus deposits made so far
}

export interface GoalSavingsResult {
  monthlyContribution: number; // required deposit per month
  totalContributions: number; // sum of all monthly deposits
  growthFromCurrent: number; // what the starting balance grows to
  totalInterest: number; // goal minus principal put in
  goalAmount: number;
  schedule: GoalYearPoint[];
}

export function computeGoalSavings(input: GoalSavingsInput): GoalSavingsResult | null {
  const { goalAmount, currentSavings, annualRatePct, years } = input;

  if (!Number.isFinite(goalAmount) || goalAmount <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (currentSavings < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const months = Math.round(years * 12);
  const i = annualRatePct / 100 / 12; // monthly rate

  // Future value of the existing savings at the end of the horizon.
  const grownCurrent = currentSavings * Math.pow(1 + i, months);

  // The remaining gap must be filled by an ordinary annuity of monthly deposits.
  const remaining = goalAmount - grownCurrent;

  let monthlyContribution: number;
  if (remaining <= 0) {
    // Existing savings alone already reach (or exceed) the goal.
    monthlyContribution = 0;
  } else if (i === 0) {
    monthlyContribution = remaining / months;
  } else {
    // FV_annuity = PMT * ((1+i)^n - 1) / i  ->  solve for PMT.
    const factor = (Math.pow(1 + i, months) - 1) / i;
    monthlyContribution = remaining / factor;
  }

  // Simulate forward to build the schedule.
  let balance = currentSavings;
  const schedule: GoalYearPoint[] = [
    { year: 0, balance: currentSavings, contributed: currentSavings },
  ];
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + i) + monthlyContribution;
    if (m % 12 === 0 || m === months) {
      const contributed = currentSavings + monthlyContribution * m;
      schedule.push({ year: m / 12, balance, contributed });
    }
  }

  const totalContributions = monthlyContribution * months;
  const totalInterest = goalAmount - currentSavings - totalContributions;

  return {
    monthlyContribution,
    totalContributions,
    growthFromCurrent: grownCurrent,
    totalInterest,
    goalAmount,
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
