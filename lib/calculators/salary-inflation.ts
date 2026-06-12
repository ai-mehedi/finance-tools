// Pure logic for the Salary Inflation Calculator.
// Compares the nominal growth of a salary (from annual raises) against the
// erosion of purchasing power from inflation. It reports the real (inflation
// adjusted) salary in today's dollars and the real annual change, with a
// schedule that plots nominal versus real value for charting.

export interface SalaryInflationInput {
  currentSalary: number;
  raisePct: number; // expected nominal annual raise, in percent
  inflationPct: number; // expected annual inflation, in percent
  years: number;
}

export interface SalaryInflationYearPoint {
  year: number;
  nominal: number; // salary in that year's dollars
  real: number; // salary expressed in today's purchasing power
}

export interface SalaryInflationResult {
  startingSalary: number;
  nominalFinal: number; // future salary on paper
  realFinal: number; // future salary in today's dollars
  purchasingPowerChange: number; // realFinal minus startingSalary
  purchasingPowerChangePct: number; // percent change in real terms
  realAnnualRatePct: number; // approximate real raise per year
  keepsUp: boolean; // does the raise beat inflation?
  schedule: SalaryInflationYearPoint[];
}

export function computeSalaryInflation(
  input: SalaryInflationInput
): SalaryInflationResult | null {
  const { currentSalary, raisePct, inflationPct, years } = input;

  if (!Number.isFinite(currentSalary) || currentSalary <= 0) return null;
  if (!Number.isFinite(raisePct)) return null;
  if (!Number.isFinite(inflationPct)) return null;
  if (!Number.isFinite(years) || years <= 0 || years > 60) return null;

  const g = raisePct / 100; // nominal growth
  const i = inflationPct / 100; // inflation
  const wholeYears = Math.round(years);

  const schedule: SalaryInflationYearPoint[] = [
    { year: 0, nominal: currentSalary, real: currentSalary },
  ];

  let nominal = currentSalary;
  for (let y = 1; y <= wholeYears; y++) {
    nominal = nominal * (1 + g);
    const real = nominal / Math.pow(1 + i, y);
    schedule.push({ year: y, nominal, real });
  }

  const nominalFinal = nominal;
  const realFinal = nominalFinal / Math.pow(1 + i, wholeYears);

  const purchasingPowerChange = realFinal - currentSalary;
  const purchasingPowerChangePct = (realFinal / currentSalary - 1) * 100;

  // Fisher-style real rate per year: (1+g)/(1+i) - 1.
  const realAnnualRatePct = ((1 + g) / (1 + i) - 1) * 100;
  const keepsUp = g >= i;

  return {
    startingSalary: currentSalary,
    nominalFinal,
    realFinal,
    purchasingPowerChange,
    purchasingPowerChangePct,
    realAnnualRatePct,
    keepsUp,
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
