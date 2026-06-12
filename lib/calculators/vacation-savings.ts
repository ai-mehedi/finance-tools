// Pure logic for the Vacation Savings Calculator.
// Works out how much you need to set aside each month to hit a trip budget by a
// target date, optionally seeding the goal with money you have already saved and
// letting that pot earn a little interest in a savings account along the way.

export interface VacationSavingsInput {
  goal: number; // total cost of the trip
  alreadySaved: number; // money set aside so far
  months: number; // months until the trip
  annualRatePct: number; // savings interest rate, percent per year
}

export interface VacationSavingsMonthPoint {
  month: number;
  balance: number;
  contributed: number; // already saved plus deposits made so far
}

export interface VacationSavingsResult {
  monthlyDeposit: number; // required deposit at the end of each month
  totalDeposits: number; // sum of all monthly deposits
  interestEarned: number; // growth contributed by interest
  remainingToSave: number; // goal minus already saved (before interest)
  schedule: VacationSavingsMonthPoint[];
  fundedByExisting: boolean; // already saved alone meets the goal
}

export function computeVacationSavings(input: VacationSavingsInput): VacationSavingsResult | null {
  const { goal, alreadySaved, months, annualRatePct } = input;

  if (!Number.isFinite(goal) || goal <= 0) return null;
  if (!Number.isFinite(months) || months <= 0) return null;
  if (alreadySaved < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const n = Math.round(months);
  const monthlyRate = annualRatePct / 100 / 12;

  // Future value of the existing pot after n months of growth.
  const grownExisting = alreadySaved * Math.pow(1 + monthlyRate, n);

  // Remaining future value to raise through monthly deposits.
  const targetFromDeposits = Math.max(0, goal - grownExisting);

  let monthlyDeposit: number;
  if (targetFromDeposits <= 0) {
    monthlyDeposit = 0;
  } else if (monthlyRate === 0) {
    monthlyDeposit = targetFromDeposits / n;
  } else {
    // Ordinary annuity: FV = PMT * ((1+r)^n - 1) / r  ->  PMT = FV * r / ((1+r)^n - 1)
    const factor = (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
    monthlyDeposit = targetFromDeposits / factor;
  }

  // Simulate to build the schedule and capture rounding-true interest.
  let balance = alreadySaved;
  const schedule: VacationSavingsMonthPoint[] = [
    { month: 0, balance: alreadySaved, contributed: alreadySaved },
  ];
  for (let m = 1; m <= n; m++) {
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
    schedule.push({
      month: m,
      balance,
      contributed: alreadySaved + monthlyDeposit * m,
    });
  }

  const totalDeposits = monthlyDeposit * n;
  const interestEarned = balance - alreadySaved - totalDeposits;
  const remainingToSave = Math.max(0, goal - alreadySaved);

  return {
    monthlyDeposit,
    totalDeposits,
    interestEarned,
    remainingToSave,
    schedule,
    fundedByExisting: targetFromDeposits <= 0,
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
