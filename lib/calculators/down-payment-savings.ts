// Pure logic for the Down Payment Savings Calculator.
// Given a savings goal (the down payment you want), how much you already have,
// a monthly contribution and an annual interest rate, it simulates month by
// month how long it takes to reach the goal and exposes a per-period schedule
// for charting the growing balance.

export interface DownPaymentSavingsInput {
  goal: number; // target down payment amount
  currentSavings: number; // money already saved
  monthlyContribution: number; // saved each month
  annualRatePct: number; // interest on savings, per year
}

export interface SavingsPoint {
  month: number;
  balance: number;
  contributed: number; // current savings + contributions made so far
}

export interface DownPaymentSavingsResult {
  monthsToGoal: number; // whole months until the goal is reached
  yearsToGoal: number; // monthsToGoal expressed in years
  reached: boolean; // false if not reached within the cap
  totalContributed: number; // current savings + all monthly deposits
  interestEarned: number; // balance at goal minus contributions
  finalBalance: number;
  schedule: SavingsPoint[];
}

const MAX_MONTHS = 50 * 12; // cap the simulation at 50 years

export function computeDownPaymentSavings(
  input: DownPaymentSavingsInput
): DownPaymentSavingsResult | null {
  const { goal, currentSavings, monthlyContribution, annualRatePct } = input;

  if (!Number.isFinite(goal) || goal <= 0) return null;
  if (currentSavings < 0 || monthlyContribution < 0 || annualRatePct < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;

  let balance = currentSavings;
  let contributed = currentSavings;
  const schedule: SavingsPoint[] = [
    { month: 0, balance, contributed },
  ];

  let monthsToGoal = 0;
  let reached = balance >= goal;

  if (!reached && monthlyContribution <= 0 && monthlyRate <= 0) {
    // No growth possible and goal not met yet.
    return {
      monthsToGoal: MAX_MONTHS,
      yearsToGoal: MAX_MONTHS / 12,
      reached: false,
      totalContributed: contributed,
      interestEarned: 0,
      finalBalance: balance,
      schedule,
    };
  }

  for (let m = 1; m <= MAX_MONTHS && !reached; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    contributed += monthlyContribution;
    monthsToGoal = m;
    if (balance >= goal) reached = true;
    if (m % 6 === 0 || reached) {
      schedule.push({ month: m, balance, contributed });
    }
  }

  const totalContributed = contributed;
  const interestEarned = balance - totalContributed;

  return {
    monthsToGoal,
    yearsToGoal: monthsToGoal / 12,
    reached,
    totalContributed,
    interestEarned,
    finalBalance: balance,
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
