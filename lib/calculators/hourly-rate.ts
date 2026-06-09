// Pure, framework-agnostic logic for the Hourly Rate Calculator.
// Converts a pay amount given for any period into the equivalent hourly,
// daily, weekly, monthly and yearly pay, based on a working schedule.

export type PayPeriod = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

export interface HourlyRateInput {
  /** The pay amount the user entered. */
  amount: number;
  /** Which period the amount refers to. */
  period: PayPeriod;
  /** Hours worked per week (e.g. 40). */
  hoursPerWeek: number;
  /** Days worked per week (e.g. 5). */
  daysPerWeek: number;
  /** Paid weeks per year (e.g. 52, or 48 if you take 4 unpaid weeks). */
  weeksPerYear: number;
}

export interface HourlyRateResult {
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  /** Derived: total paid hours in a year. */
  annualHours: number;
}

/**
 * Convert the entered amount to a yearly figure, then derive every period.
 * Returns null when the schedule is invalid (can't divide by zero hours/days/weeks).
 */
export function computeHourlyRate(input: HourlyRateInput): HourlyRateResult | null {
  const { amount, period, hoursPerWeek, daysPerWeek, weeksPerYear } = input;

  if (hoursPerWeek <= 0 || daysPerWeek <= 0 || weeksPerYear <= 0) return null;
  if (!Number.isFinite(amount) || amount < 0) return null;

  const annualHours = hoursPerWeek * weeksPerYear;

  // Step 1: normalize the entered amount to a single yearly number.
  let yearly: number;
  switch (period) {
    case "hourly":
      yearly = amount * annualHours;
      break;
    case "daily":
      yearly = amount * daysPerWeek * weeksPerYear;
      break;
    case "weekly":
      yearly = amount * weeksPerYear;
      break;
    case "monthly":
      yearly = amount * 12;
      break;
    case "yearly":
      yearly = amount;
      break;
    default:
      return null;
  }

  // Step 2: derive every period from the yearly figure.
  const weekly = yearly / weeksPerYear;
  return {
    hourly: yearly / annualHours,
    daily: weekly / daysPerWeek,
    weekly,
    monthly: yearly / 12,
    yearly,
    annualHours,
  };
}

// Fixed en-US locale so server and client render identical strings (no hydration mismatch).
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUSD(n: number): string {
  return usd.format(Number.isFinite(n) ? n : 0);
}
