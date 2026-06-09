// Pure logic for the Annual Income Calculator.
// Converts a pay rate at any common cadence into yearly, monthly, weekly,
// daily and hourly figures, based on the hours and days you actually work.
// A single set of derived numbers, so no chart.

export type PayPeriod = "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "annually";

export interface AnnualIncomeInput {
  amount: number; // pay for one unit of the chosen period
  period: PayPeriod;
  hoursPerWeek: number;
  daysPerWeek: number;
  weeksPerYear: number;
}

export interface AnnualIncomeResult {
  annual: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  daily: number;
  hourly: number;
  hoursPerYear: number;
}

export function computeAnnualIncome(input: AnnualIncomeInput): AnnualIncomeResult | null {
  const { amount, period, hoursPerWeek, daysPerWeek, weeksPerYear } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (hoursPerWeek <= 0 || daysPerWeek <= 0 || weeksPerYear <= 0) return null;
  if (hoursPerWeek > 168 || daysPerWeek > 7 || weeksPerYear > 53) return null;

  const hoursPerYear = hoursPerWeek * weeksPerYear;

  // Normalise the entered pay to an annual figure first.
  let annual: number;
  switch (period) {
    case "hourly":
      annual = amount * hoursPerYear;
      break;
    case "daily":
      annual = amount * daysPerWeek * weeksPerYear;
      break;
    case "weekly":
      annual = amount * weeksPerYear;
      break;
    case "biweekly":
      annual = amount * (weeksPerYear / 2);
      break;
    case "monthly":
      annual = amount * 12;
      break;
    case "annually":
    default:
      annual = amount;
      break;
  }

  const monthly = annual / 12;
  const biweekly = annual / (weeksPerYear / 2);
  const weekly = annual / weeksPerYear;
  const daily = annual / (daysPerWeek * weeksPerYear);
  const hourly = annual / hoursPerYear;

  return {
    annual,
    monthly,
    biweekly,
    weekly,
    daily,
    hourly,
    hoursPerYear,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number): string => usd.format(Number.isFinite(n) ? n : 0);
