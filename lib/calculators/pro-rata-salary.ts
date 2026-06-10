// Pure logic for the Pro Rata Salary Calculator.
// Works out what a part-time, partial-year, or partial-period salary actually
// pays compared with the equivalent full-time annual figure. The pro rata
// fraction is hours worked divided by full-time hours, multiplied by the share
// of the year actually worked. A month-by-month schedule is returned so the
// earnings ramp can be charted.

export type Basis = "hours" | "days" | "weeks" | "months";

export const BASIS_FULL: Record<Basis, number> = {
  hours: 40, // full-time hours per week
  days: 5, // full-time days per week
  weeks: 52, // weeks per year
  months: 12, // months per year
};

export interface ProRataSalaryInput {
  fullTimeSalary: number; // annual full-time equivalent salary
  basis: Basis;
  workedUnits: number; // hours/week, days/week, weeks/year, or months/year
  fullTimeUnits: number; // the comparable full-time figure for the same basis
}

export interface ProRataMonthPoint {
  month: number; // 1..12
  cumulative: number; // pro rata earnings accrued by end of this month
}

export interface ProRataSalaryResult {
  fraction: number; // 0..1 share of full time
  proRataAnnual: number;
  proRataMonthly: number;
  proRataWeekly: number;
  proRataDaily: number;
  difference: number; // full-time annual minus pro rata annual
  schedule: ProRataMonthPoint[];
}

export function computeProRataSalary(input: ProRataSalaryInput): ProRataSalaryResult | null {
  const { fullTimeSalary, basis, workedUnits, fullTimeUnits } = input;

  if (!Number.isFinite(fullTimeSalary) || fullTimeSalary < 0) return null;
  if (!Number.isFinite(workedUnits) || workedUnits < 0) return null;
  if (!Number.isFinite(fullTimeUnits) || fullTimeUnits <= 0) return null;

  // Cap fraction at 1 only conceptually; allow over-100% if someone works more.
  const fraction = workedUnits / fullTimeUnits;
  if (!Number.isFinite(fraction)) return null;

  const proRataAnnual = fullTimeSalary * fraction;
  const proRataMonthly = proRataAnnual / 12;
  const proRataWeekly = proRataAnnual / 52;
  const proRataDaily = proRataAnnual / 260; // ~52 weeks * 5 working days
  const difference = fullTimeSalary - proRataAnnual;

  const schedule: ProRataMonthPoint[] = [{ month: 0, cumulative: 0 }];
  for (let m = 1; m <= 12; m++) {
    schedule.push({ month: m, cumulative: proRataMonthly * m });
  }

  return {
    fraction,
    proRataAnnual,
    proRataMonthly,
    proRataWeekly,
    proRataDaily,
    difference,
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
