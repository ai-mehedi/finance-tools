// Pure logic for the Payroll Tax Calculator.
// Computes the FICA payroll tax burden (Social Security + Medicare) and splits it
// into the employee share, the matching employer share, and the combined total.
// Social Security is 6.2% each side up to an annual wage base; Medicare is 1.45%
// each side with an extra 0.9% employee-only surtax above a high-earner threshold.

const SS_WAGE_BASE = 168_600; // 2024 Social Security wage base
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDL_MEDICARE_RATE = 0.009; // employee-only surtax
const ADDL_MEDICARE_THRESHOLD = 200_000; // single-filer threshold

export interface PayrollTaxInput {
  annualWages: number;
}

export interface PayrollTaxLine {
  label: string;
  employee: number;
  employer: number;
}

export interface PayrollTaxResult {
  socialSecurityEmployee: number;
  socialSecurityEmployer: number;
  medicareEmployee: number; // includes additional Medicare surtax
  medicareEmployer: number;
  additionalMedicare: number; // employee-only surtax portion
  employeeTotal: number;
  employerTotal: number;
  combinedTotal: number;
  effectiveRatePct: number; // combined as a percent of wages
  lines: PayrollTaxLine[];
}

export function computePayrollTax(input: PayrollTaxInput): PayrollTaxResult | null {
  const { annualWages } = input;

  if (!Number.isFinite(annualWages) || annualWages <= 0) return null;

  const ssWages = Math.min(annualWages, SS_WAGE_BASE);
  const socialSecurityEmployee = ssWages * SS_RATE;
  const socialSecurityEmployer = ssWages * SS_RATE;

  const medicareBase = annualWages * MEDICARE_RATE;
  const additionalMedicare =
    annualWages > ADDL_MEDICARE_THRESHOLD
      ? (annualWages - ADDL_MEDICARE_THRESHOLD) * ADDL_MEDICARE_RATE
      : 0;

  const medicareEmployee = medicareBase + additionalMedicare;
  const medicareEmployer = medicareBase; // employer does not pay the surtax

  const employeeTotal = socialSecurityEmployee + medicareEmployee;
  const employerTotal = socialSecurityEmployer + medicareEmployer;
  const combinedTotal = employeeTotal + employerTotal;

  const lines: PayrollTaxLine[] = [
    { label: "Social Security", employee: socialSecurityEmployee, employer: socialSecurityEmployer },
    { label: "Medicare", employee: medicareBase, employer: medicareEmployer },
    { label: "Additional Medicare", employee: additionalMedicare, employer: 0 },
  ].filter((l) => l.employee > 0 || l.employer > 0);

  return {
    socialSecurityEmployee,
    socialSecurityEmployer,
    medicareEmployee,
    medicareEmployer,
    additionalMedicare,
    employeeTotal,
    employerTotal,
    combinedTotal,
    effectiveRatePct: (combinedTotal / annualWages) * 100,
    lines,
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
