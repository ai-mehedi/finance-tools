// Pure logic for the Hourly to Salary Calculator.
// Converts an hourly wage into gross pay across every common pay period
// (weekly, biweekly, monthly, annual) and back the other way, accounting for
// hours worked per week and weeks worked per year (so unpaid time off is
// reflected). Returns a per-period bar series for charting.

export interface HourlyToSalaryInput {
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number; // paid weeks, e.g. 50 if you take 2 unpaid weeks
}

export interface PayPeriodPoint {
  label: string;
  amount: number;
}

export interface HourlyToSalaryResult {
  annual: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  daily: number; // assumes a 5-day work week
  totalHoursPerYear: number;
  schedule: PayPeriodPoint[];
}

export function computeHourlyToSalary(input: HourlyToSalaryInput): HourlyToSalaryResult | null {
  const { hourlyRate, hoursPerWeek, weeksPerYear } = input;

  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) return null;
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) return null;
  if (!Number.isFinite(weeksPerYear) || weeksPerYear <= 0 || weeksPerYear > 52) return null;

  const weekly = hourlyRate * hoursPerWeek;
  const annual = weekly * weeksPerYear;
  const monthly = annual / 12;
  const biweekly = annual / 26;
  const daily = weekly / 5;
  const totalHoursPerYear = hoursPerWeek * weeksPerYear;

  const schedule: PayPeriodPoint[] = [
    { label: "Daily", amount: daily },
    { label: "Weekly", amount: weekly },
    { label: "Biweekly", amount: biweekly },
    { label: "Monthly", amount: monthly },
  ];

  return { annual, monthly, biweekly, weekly, daily, totalHoursPerYear, schedule };
}

// Reverse helper: annual salary back to an effective hourly rate.
export function salaryToHourly(annual: number, hoursPerWeek: number, weeksPerYear: number): number {
  const hours = hoursPerWeek * weeksPerYear;
  if (hours <= 0) return 0;
  return annual / hours;
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
