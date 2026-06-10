// Pure logic for the Investment Goal Calculator.
// Solves for the monthly contribution required to reach a target amount by a
// given date, accounting for a starting balance and an expected return.
// Inverts the future value of an annuity formula, then simulates month by
// month so the balance can be charted approaching the goal line.

export interface InvestmentGoalInput {
  goalAmount: number;
  currentSavings: number;
  annualRatePct: number;
  years: number;
}

export interface GoalYearPoint {
  year: number;
  balance: number;
}

export interface InvestmentGoalResult {
  goalAmount: number;
  monthlyContribution: number; // required monthly deposit to hit the goal
  totalContributions: number; // sum of all monthly deposits
  totalGrowth: number; // goal minus current savings minus contributions
  startGrowsTo: number; // what the current savings alone become
  schedule: GoalYearPoint[];
  reachable: boolean; // false if current savings alone already exceed the goal
}

export function computeInvestmentGoal(
  input: InvestmentGoalInput
): InvestmentGoalResult | null {
  const { goalAmount, currentSavings, annualRatePct, years } = input;

  if (!Number.isFinite(goalAmount) || goalAmount <= 0) return null;
  if (!Number.isFinite(currentSavings) || currentSavings < 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const months = Math.round(years * 12);
  const i = annualRatePct / 100 / 12; // monthly rate

  // Future value the starting balance reaches on its own.
  const startGrowsTo = currentSavings * Math.pow(1 + i, months);

  // Remaining gap the monthly contributions must cover.
  const gap = goalAmount - startGrowsTo;

  let monthlyContribution = 0;
  if (gap > 0) {
    if (i === 0) {
      monthlyContribution = gap / months;
    } else {
      // FV of ordinary annuity: gap = PMT * ((1+i)^n - 1) / i  ->  solve for PMT
      const factor = (Math.pow(1 + i, months) - 1) / i;
      monthlyContribution = gap / factor;
    }
  }

  const reachable = startGrowsTo < goalAmount;

  // Simulate the balance for the chart.
  const schedule: GoalYearPoint[] = [{ year: 0, balance: currentSavings }];
  let balance = currentSavings;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + i) + monthlyContribution;
    if (m % 12 === 0 || m === months) {
      schedule.push({ year: m / 12, balance });
    }
  }

  const totalContributions = monthlyContribution * months;
  const totalGrowth = goalAmount - currentSavings - totalContributions;

  return {
    goalAmount,
    monthlyContribution,
    totalContributions,
    totalGrowth,
    startGrowsTo,
    schedule,
    reachable,
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
