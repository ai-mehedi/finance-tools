// Pure logic for the Pension Calculator.
// Estimates a defined-benefit pension's annual and monthly income using the
// classic formula: annual pension = years of service times final (or average)
// salary times an accrual rate (the "multiplier"). It can apply an early or
// late retirement adjustment per year away from the normal retirement age, and
// projects the salary forward to retirement with an assumed growth rate.
// Returns a per-year accrual schedule for charting how the benefit builds up.

export type PayoutFrequency = "monthly" | "annually";

export interface PensionInput {
  currentSalary: number; // salary today
  currentAge: number;
  retirementAge: number;
  yearsOfService: number; // total service credited at retirement
  multiplierPct: number; // accrual rate per year of service, e.g. 1.5
  salaryGrowthPct: number; // annual raise assumption until retirement
  normalRetirementAge: number;
  adjustmentPerYearPct: number; // +/- per year early/late vs normal age
}

export interface PensionYearPoint {
  age: number;
  serviceYears: number;
  accruedAnnual: number; // pension earned to date at projected salary
}

export interface PensionResult {
  finalSalary: number; // projected salary at retirement
  grossAnnualPension: number; // before early/late adjustment
  adjustmentFactor: number; // multiplier applied for timing
  annualPension: number; // after adjustment
  monthlyPension: number;
  replacementRatio: number; // annualPension / finalSalary
  totalAccrualPct: number; // yearsOfService times multiplier
  schedule: PensionYearPoint[];
}

export function computePension(input: PensionInput): PensionResult | null {
  const {
    currentSalary,
    currentAge,
    retirementAge,
    yearsOfService,
    multiplierPct,
    salaryGrowthPct,
    normalRetirementAge,
    adjustmentPerYearPct,
  } = input;

  if (!Number.isFinite(currentSalary) || currentSalary <= 0) return null;
  if (!Number.isFinite(yearsOfService) || yearsOfService < 0) return null;
  if (!Number.isFinite(multiplierPct) || multiplierPct < 0) return null;
  if (!Number.isFinite(retirementAge) || !Number.isFinite(currentAge)) return null;
  if (retirementAge < currentAge) return null;

  const growth = salaryGrowthPct / 100;
  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  const finalSalary = currentSalary * Math.pow(1 + growth, yearsToRetire);

  const totalAccrualPct = yearsOfService * multiplierPct;
  const grossAnnualPension = finalSalary * (totalAccrualPct / 100);

  // Timing adjustment: positive adjustment for working past normal age,
  // negative (reduction) for retiring before it.
  const yearsFromNormal = retirementAge - normalRetirementAge;
  const adjustmentFactor = Math.max(0, 1 + (yearsFromNormal * adjustmentPerYearPct) / 100);

  const annualPension = grossAnnualPension * adjustmentFactor;
  const monthlyPension = annualPension / 12;
  const replacementRatio = finalSalary > 0 ? annualPension / finalSalary : 0;

  // Schedule: how the accrued benefit grows each year toward retirement.
  // Service at retirement is yearsOfService; we back-fill service per year.
  const schedule: PensionYearPoint[] = [];
  const startService = Math.max(0, yearsOfService - yearsToRetire);
  for (let i = 0; i <= yearsToRetire; i++) {
    const age = currentAge + i;
    const serviceYears = startService + i;
    const projectedSalary = currentSalary * Math.pow(1 + growth, i);
    const accruedAnnual = projectedSalary * ((serviceYears * multiplierPct) / 100) * adjustmentFactor;
    schedule.push({ age, serviceYears, accruedAnnual: Math.max(0, accruedAnnual) });
  }

  return {
    finalSalary,
    grossAnnualPension,
    adjustmentFactor,
    annualPension,
    monthlyPension,
    replacementRatio,
    totalAccrualPct,
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
