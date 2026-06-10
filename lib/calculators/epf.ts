// Pure logic for the EPF (Employees' Provident Fund) Calculator.
// Models the Indian EPF scheme: the employee contributes a percentage of basic
// + DA, the employer matches it, but a slice of the employer share (8.33% of
// wages, capped) is diverted to EPS (pension) and does not earn EPF interest.
// Interest is credited annually on the running balance. Both basic salary and
// contributions grow each year by an assumed increment. Returns a yearly
// schedule for charting the corpus.

export interface EpfInput {
  monthlyBasicDA: number; // basic + dearness allowance per month
  employeeRatePct: number; // usually 12
  employerRatePct: number; // usually 12
  currentAgePct: number; // current age
  retirementAge: number;
  annualInterestPct: number; // EPF declared rate, e.g. 8.25
  salaryGrowthPct: number; // yearly increment to basic + DA
  currentBalance: number; // existing EPF corpus, if any
}

export interface EpfYearPoint {
  year: number;
  age: number;
  employeeContrib: number;
  employerContrib: number; // EPF share only (after EPS diversion)
  interest: number;
  balance: number;
}

export interface EpfResult {
  maturityBalance: number;
  totalEmployee: number;
  totalEmployer: number; // EPF share only
  totalInterest: number;
  totalEpsDiverted: number;
  schedule: EpfYearPoint[];
}

// Statutory EPS diversion: 8.33% of wages, but wages capped at Rs 15,000/month.
const EPS_RATE = 0.0833;
const EPS_WAGE_CAP = 15000;

export function computeEpf(input: EpfInput): EpfResult | null {
  const {
    monthlyBasicDA,
    employeeRatePct,
    employerRatePct,
    currentAgePct,
    retirementAge,
    annualInterestPct,
    salaryGrowthPct,
    currentBalance,
  } = input;

  if (!Number.isFinite(monthlyBasicDA) || monthlyBasicDA <= 0) return null;
  if (!Number.isFinite(currentAgePct) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAgePct) return null;
  if (employeeRatePct < 0 || employerRatePct < 0) return null;
  if (annualInterestPct < 0 || currentBalance < 0) return null;

  const years = Math.round(retirementAge - currentAgePct);
  const annualRate = annualInterestPct / 100;
  const growth = salaryGrowthPct / 100;

  let balance = currentBalance;
  let wage = monthlyBasicDA;
  let totalEmployee = 0;
  let totalEmployer = 0;
  let totalInterest = 0;
  let totalEps = 0;

  const schedule: EpfYearPoint[] = [
    { year: 0, age: Math.round(currentAgePct), employeeContrib: 0, employerContrib: 0, interest: 0, balance },
  ];

  for (let yr = 1; yr <= years; yr++) {
    const employeeMonthly = (wage * employeeRatePct) / 100;
    const employerGrossMonthly = (wage * employerRatePct) / 100;
    const epsMonthly = Math.min(wage, EPS_WAGE_CAP) * EPS_RATE;
    const employerEpfMonthly = Math.max(0, employerGrossMonthly - epsMonthly);

    const yearEmployee = employeeMonthly * 12;
    const yearEmployerEpf = employerEpfMonthly * 12;
    const yearEps = epsMonthly * 12;

    // Interest accrues over the year. Approximate by crediting on the
    // opening balance plus half of the year's fresh contributions.
    const fresh = yearEmployee + yearEmployerEpf;
    const interest = (balance + fresh / 2) * annualRate;

    balance = balance + fresh + interest;
    totalEmployee += yearEmployee;
    totalEmployer += yearEmployerEpf;
    totalInterest += interest;
    totalEps += yearEps;

    schedule.push({
      year: yr,
      age: Math.round(currentAgePct) + yr,
      employeeContrib: yearEmployee,
      employerContrib: yearEmployerEpf,
      interest,
      balance,
    });

    wage = wage * (1 + growth);
  }

  return {
    maturityBalance: balance,
    totalEmployee,
    totalEmployer,
    totalInterest,
    totalEpsDiverted: totalEps,
    schedule,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
