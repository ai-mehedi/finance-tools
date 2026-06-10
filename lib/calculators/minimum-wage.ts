// Pure logic for the Minimum Wage Calculator.
// Converts an hourly minimum wage into gross earnings across pay periods
// (daily, weekly, monthly, yearly) given the hours worked per week, and
// estimates overtime pay above a weekly threshold at a chosen multiplier.

export type Period = "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "annual";

export interface MinimumWageInput {
  hourlyWage: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  overtimeThreshold: number; // weekly hours after which overtime applies
  overtimeMultiplier: number; // e.g. 1.5 for time-and-a-half
}

export interface PeriodPoint {
  label: string;
  period: Period;
  amount: number;
}

export interface MinimumWageResult {
  annualGross: number;
  regularWeekly: number;
  overtimeWeekly: number;
  weeklyGross: number;
  overtimeHours: number;
  hourly: number;
  daily: number;
  monthly: number;
  schedule: PeriodPoint[];
}

export function computeMinimumWage(input: MinimumWageInput): MinimumWageResult | null {
  const { hourlyWage, hoursPerWeek, weeksPerYear, overtimeThreshold, overtimeMultiplier } = input;

  if (!Number.isFinite(hourlyWage) || hourlyWage < 0) return null;
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) return null;
  if (!Number.isFinite(weeksPerYear) || weeksPerYear <= 0 || weeksPerYear > 53) return null;
  if (!Number.isFinite(overtimeThreshold) || overtimeThreshold < 0) return null;
  if (!Number.isFinite(overtimeMultiplier) || overtimeMultiplier < 1) return null;

  const regularHours = Math.min(hoursPerWeek, overtimeThreshold);
  const overtimeHours = Math.max(0, hoursPerWeek - overtimeThreshold);

  const regularWeekly = regularHours * hourlyWage;
  const overtimeWeekly = overtimeHours * hourlyWage * overtimeMultiplier;
  const weeklyGross = regularWeekly + overtimeWeekly;

  const annualGross = weeklyGross * weeksPerYear;
  const daily = hoursPerWeek > 0 ? weeklyGross / (hoursPerWeek / 8) : 0; // assumes an 8-hour day
  const monthly = annualGross / 12;
  const biweekly = weeklyGross * 2;

  const schedule: PeriodPoint[] = [
    { label: "Hourly", period: "hourly", amount: hourlyWage },
    { label: "Daily", period: "daily", amount: daily },
    { label: "Weekly", period: "weekly", amount: weeklyGross },
    { label: "Bi-weekly", period: "biweekly", amount: biweekly },
    { label: "Monthly", period: "monthly", amount: monthly },
    { label: "Annual", period: "annual", amount: annualGross },
  ];

  return {
    annualGross,
    regularWeekly,
    overtimeWeekly,
    weeklyGross,
    overtimeHours,
    hourly: hourlyWage,
    daily,
    monthly,
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
