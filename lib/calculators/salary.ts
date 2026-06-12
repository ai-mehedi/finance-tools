// Pure logic for the Salary Calculator.
// Converts a single pay rate (entered for a chosen period) into every other
// pay period — hourly, daily, weekly, biweekly, semi-monthly, monthly and
// annual — using the hours worked per week and days worked per week.
// Exposes a per-period breakdown array for charting.

export type PayPeriod =
  | "hourly"
  | "daily"
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "annual";

// How many of each period occur in one year.
export const PERIODS_PER_YEAR: Record<PayPeriod, number> = {
  hourly: 0, // derived from hours, handled separately
  daily: 0, // derived from days, handled separately
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  annual: 1,
};

export interface SalaryInput {
  amount: number; // the pay amount entered
  period: PayPeriod; // the period that amount applies to
  hoursPerWeek: number;
  daysPerWeek: number;
}

export interface SalaryBreakdownRow {
  period: PayPeriod;
  label: string;
  amount: number;
}

export interface SalaryResult {
  annual: number;
  monthly: number;
  semimonthly: number;
  biweekly: number;
  weekly: number;
  daily: number;
  hourly: number;
  hoursPerYear: number;
  daysPerYear: number;
  breakdown: SalaryBreakdownRow[];
}

const LABELS: Record<PayPeriod, string> = {
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  semimonthly: "Semi-monthly",
  monthly: "Monthly",
  annual: "Annual",
};

export function computeSalary(input: SalaryInput): SalaryResult | null {
  const { amount, period, hoursPerWeek, daysPerWeek } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0 || hoursPerWeek > 168) return null;
  if (!Number.isFinite(daysPerWeek) || daysPerWeek <= 0 || daysPerWeek > 7) return null;

  const weeksPerYear = 52;
  const hoursPerYear = hoursPerWeek * weeksPerYear;
  const daysPerYear = daysPerWeek * weeksPerYear;

  // First reduce whatever was entered to an annual figure.
  let annual: number;
  switch (period) {
    case "hourly":
      annual = amount * hoursPerYear;
      break;
    case "daily":
      annual = amount * daysPerYear;
      break;
    case "weekly":
      annual = amount * 52;
      break;
    case "biweekly":
      annual = amount * 26;
      break;
    case "semimonthly":
      annual = amount * 24;
      break;
    case "monthly":
      annual = amount * 12;
      break;
    case "annual":
      annual = amount;
      break;
    default:
      annual = amount;
  }

  const result: SalaryResult = {
    annual,
    monthly: annual / 12,
    semimonthly: annual / 24,
    biweekly: annual / 26,
    weekly: annual / 52,
    daily: annual / daysPerYear,
    hourly: annual / hoursPerYear,
    hoursPerYear,
    daysPerYear,
    breakdown: [],
  };

  result.breakdown = [
    { period: "hourly", label: LABELS.hourly, amount: result.hourly },
    { period: "daily", label: LABELS.daily, amount: result.daily },
    { period: "weekly", label: LABELS.weekly, amount: result.weekly },
    { period: "biweekly", label: LABELS.biweekly, amount: result.biweekly },
    { period: "semimonthly", label: LABELS.semimonthly, amount: result.semimonthly },
    { period: "monthly", label: LABELS.monthly, amount: result.monthly },
    { period: "annual", label: LABELS.annual, amount: result.annual },
  ];

  return result;
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
