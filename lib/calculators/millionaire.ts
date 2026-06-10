// Pure logic for the Millionaire Savings Calculator.
// Works out how long it takes a current nest egg plus monthly savings to reach a
// target (default $1,000,000) at a given annual return, and exposes a per-year
// schedule for charting the climb to the goal.

export interface MillionaireInput {
  currentSavings: number;
  monthlyContribution: number;
  annualReturnPct: number;
  target: number;
  maxYears: number; // cap the simulation so it always terminates
}

export interface MillionaireYearPoint {
  year: number;
  balance: number;
  contributed: number; // starting savings plus contributions so far
}

export interface MillionaireResult {
  reached: boolean;
  monthsToTarget: number; // months until balance >= target (0 if never within cap)
  yearsToTarget: number; // monthsToTarget expressed in years (decimal)
  ageAtTarget: number | null; // null when age not supplied or goal not reached
  totalContributed: number; // contributions only (excludes starting savings)
  totalGrowth: number; // balance at target minus money put in
  finalBalance: number; // balance at the month the goal is hit (or cap)
  schedule: MillionaireYearPoint[];
}

export function computeMillionaire(
  input: MillionaireInput & { currentAge?: number }
): MillionaireResult | null {
  const { currentSavings, monthlyContribution, annualReturnPct, target, maxYears, currentAge } = input;

  if (!Number.isFinite(target) || target <= 0) return null;
  if (currentSavings < 0 || monthlyContribution < 0) return null;
  if (!Number.isFinite(annualReturnPct)) return null;
  if (!Number.isFinite(maxYears) || maxYears <= 0) return null;

  const monthlyRate = annualReturnPct / 100 / 12;
  const maxMonths = Math.round(maxYears * 12);

  let balance = currentSavings;
  let monthsToTarget = 0;
  let reached = currentSavings >= target;

  const schedule: MillionaireYearPoint[] = [
    { year: 0, balance: currentSavings, contributed: currentSavings },
  ];

  if (!reached) {
    for (let m = 1; m <= maxMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      if (m % 12 === 0 || m === maxMonths) {
        schedule.push({
          year: m / 12,
          balance,
          contributed: currentSavings + monthlyContribution * m,
        });
      }
      if (balance >= target) {
        monthsToTarget = m;
        reached = true;
        break;
      }
    }
  }

  // If the goal was reached mid-year, make sure a final schedule point exists.
  if (reached && monthsToTarget > 0) {
    const lastYear = schedule[schedule.length - 1].year;
    const reachedYear = monthsToTarget / 12;
    if (reachedYear > lastYear) {
      schedule.push({
        year: reachedYear,
        balance,
        contributed: currentSavings + monthlyContribution * monthsToTarget,
      });
    }
  }

  const totalContributed = monthlyContribution * monthsToTarget;
  const finalBalance = balance;
  const totalGrowth = finalBalance - currentSavings - totalContributed;
  const yearsToTarget = monthsToTarget / 12;
  const ageAtTarget =
    reached && Number.isFinite(currentAge as number)
      ? (currentAge as number) + yearsToTarget
      : null;

  return {
    reached,
    monthsToTarget,
    yearsToTarget,
    ageAtTarget,
    totalContributed,
    totalGrowth,
    finalBalance,
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

export function formatYears(years: number): string {
  if (!Number.isFinite(years) || years <= 0) return "0 years";
  const whole = Math.floor(years);
  const months = Math.round((years - whole) * 12);
  if (whole === 0) return `${months} mo`;
  if (months === 0) return `${whole} yr`;
  return `${whole} yr ${months} mo`;
}
