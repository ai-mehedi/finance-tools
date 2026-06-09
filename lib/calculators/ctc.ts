// Pure logic for the CTC (Cost To Company) Calculator.
// Breaks an annual CTC into its standard components: basic pay, allowances,
// employer retirement contribution and a gratuity provision, then nets out
// the employee retirement contribution and income tax to estimate take-home pay.

export interface CtcInput {
  annualCtc: number;
  basicPct: number; // basic salary as a percent of CTC
  retirementPct: number; // employer + employee retirement contribution rate on basic
  gratuityPct: number; // gratuity provision rate on basic
  taxPct: number; // effective income tax rate on taxable income
}

export interface CtcComponent {
  label: string;
  value: number;
}

export interface CtcResult {
  annualCtc: number;
  basic: number;
  allowances: number;
  employerRetirement: number;
  gratuity: number;
  grossSalary: number; // CTC minus employer retirement and gratuity provisions
  employeeRetirement: number;
  incomeTax: number;
  annualTakeHome: number;
  monthlyTakeHome: number;
  components: CtcComponent[];
}

export function computeCtc(input: CtcInput): CtcResult | null {
  const { annualCtc, basicPct, retirementPct, gratuityPct, taxPct } = input;

  if (!Number.isFinite(annualCtc) || annualCtc <= 0) return null;
  if (basicPct <= 0 || basicPct > 100) return null;
  if (retirementPct < 0 || gratuityPct < 0 || taxPct < 0) return null;
  if (retirementPct > 100 || gratuityPct > 100 || taxPct > 100) return null;

  const basic = annualCtc * (basicPct / 100);
  const employerRetirement = basic * (retirementPct / 100);
  const employeeRetirement = basic * (retirementPct / 100);
  const gratuity = basic * (gratuityPct / 100);

  // Allowances make up whatever is left of the CTC after the basic pay and the
  // employer-side provisions (retirement and gratuity) are set aside.
  const allowances = Math.max(0, annualCtc - basic - employerRetirement - gratuity);

  // Gross salary is the part of the CTC that reaches the payroll: everything
  // except the employer retirement contribution and the gratuity provision.
  const grossSalary = basic + allowances;

  // Taxable income removes the employee retirement contribution (a common
  // deduction). Income tax is then applied at the effective rate provided.
  const taxableIncome = Math.max(0, grossSalary - employeeRetirement);
  const incomeTax = taxableIncome * (taxPct / 100);

  const annualTakeHome = grossSalary - employeeRetirement - incomeTax;
  const monthlyTakeHome = annualTakeHome / 12;

  const components: CtcComponent[] = [
    { label: "Take-home pay", value: annualTakeHome },
    { label: "Income tax", value: incomeTax },
    { label: "Retirement (your share)", value: employeeRetirement },
    { label: "Employer retirement", value: employerRetirement },
    { label: "Gratuity provision", value: gratuity },
  ].filter((c) => c.value > 0);

  return {
    annualCtc,
    basic,
    allowances,
    employerRetirement,
    gratuity,
    grossSalary,
    employeeRetirement,
    incomeTax,
    annualTakeHome,
    monthlyTakeHome,
    components,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
