// Pure logic for the Salary Increment Calculator.
// Applies a fixed annual percentage raise to a starting salary over a chosen
// number of years and reports the new salary, the increase amount, and a
// year-by-year schedule for charting.

export interface SalaryIncrementInput {
  currentSalary: number;
  incrementPct: number; // raise applied each year, in percent
  years: number; // number of annual raises to apply
}

export interface SalaryIncrementYearPoint {
  year: number; // 0 = starting salary, 1 = after first raise, ...
  salary: number;
  raise: number; // dollar raise applied this year (0 at year 0)
}

export interface SalaryIncrementResult {
  startingSalary: number;
  finalSalary: number;
  firstYearRaise: number; // dollar value of the very first raise
  totalIncrease: number; // finalSalary minus startingSalary
  totalIncreasePct: number; // cumulative growth in percent
  cumulativeEarnings: number; // sum of salary paid across all years (after each raise)
  schedule: SalaryIncrementYearPoint[];
}

export function computeSalaryIncrement(
  input: SalaryIncrementInput
): SalaryIncrementResult | null {
  const { currentSalary, incrementPct, years } = input;

  if (!Number.isFinite(currentSalary) || currentSalary <= 0) return null;
  if (!Number.isFinite(incrementPct)) return null;
  if (!Number.isFinite(years) || years <= 0 || years > 60) return null;

  const r = incrementPct / 100;
  const wholeYears = Math.round(years);

  const schedule: SalaryIncrementYearPoint[] = [
    { year: 0, salary: currentSalary, raise: 0 },
  ];

  let salary = currentSalary;
  let cumulativeEarnings = 0; // earnings counted for years 1..wholeYears
  let firstYearRaise = 0;

  for (let y = 1; y <= wholeYears; y++) {
    const raise = salary * r;
    if (y === 1) firstYearRaise = raise;
    salary = salary + raise;
    cumulativeEarnings += salary;
    schedule.push({ year: y, salary, raise });
  }

  const finalSalary = salary;
  const totalIncrease = finalSalary - currentSalary;
  const totalIncreasePct = (finalSalary / currentSalary - 1) * 100;

  return {
    startingSalary: currentSalary,
    finalSalary,
    firstYearRaise,
    totalIncrease,
    totalIncreasePct,
    cumulativeEarnings,
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
