// Pure logic for the Salary to Hourly Calculator.
// Converts an annual (or other-period) salary into an equivalent hourly wage
// based on the hours worked per week and weeks worked per year. Also breaks the
// pay down into hourly, daily, weekly and monthly figures and exposes a small
// schedule that shows how the hourly rate changes as weekly hours change.

export type PayPeriod = "annual" | "monthly" | "weekly";

export const PERIODS_PER_YEAR: Record<PayPeriod, number> = {
  annual: 1,
  monthly: 12,
  weekly: 52,
};

export interface SalaryToHourlyInput {
  salary: number; // amount for the chosen pay period
  period: PayPeriod;
  hoursPerWeek: number;
  weeksPerYear: number;
}

export interface SalaryHoursPoint {
  hoursPerWeek: number;
  hourlyRate: number;
}

export interface SalaryToHourlyResult {
  annualSalary: number;
  hourlyRate: number;
  dailyPay: number; // based on an 8 hour reference day or pro-rated day
  weeklyPay: number;
  monthlyPay: number;
  totalHoursPerYear: number;
  schedule: SalaryHoursPoint[];
}

export function computeSalaryToHourly(input: SalaryToHourlyInput): SalaryToHourlyResult | null {
  const { salary, period, hoursPerWeek, weeksPerYear } = input;

  if (!Number.isFinite(salary) || salary < 0) return null;
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) return null;
  if (!Number.isFinite(weeksPerYear) || weeksPerYear <= 0 || weeksPerYear > 53) return null;

  const annualSalary = salary * PERIODS_PER_YEAR[period];
  const totalHoursPerYear = hoursPerWeek * weeksPerYear;
  const hourlyRate = annualSalary / totalHoursPerYear;

  const weeklyPay = annualSalary / weeksPerYear;
  const monthlyPay = annualSalary / 12;
  const dailyPay = (weeklyPay / hoursPerWeek) * Math.min(hoursPerWeek, 8); // a typical working day

  // How the hourly rate shifts as weekly hours change, holding salary fixed.
  const schedule: SalaryHoursPoint[] = [];
  for (let h = 20; h <= 60; h += 5) {
    schedule.push({ hoursPerWeek: h, hourlyRate: annualSalary / (h * weeksPerYear) });
  }

  return {
    annualSalary,
    hourlyRate,
    dailyPay,
    weeklyPay,
    monthlyPay,
    totalHoursPerYear,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
