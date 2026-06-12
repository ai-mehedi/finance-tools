// Pure logic for the Take Home Pay Calculator.
// Estimates net pay from gross salary by subtracting federal income tax (2024
// progressive brackets after the standard deduction), Social Security and
// Medicare (FICA), a flat state tax rate, and pre-tax deductions like 401(k)
// and health premiums. Returns a withholding breakdown for charting.

export type FilingStatus = "single" | "married" | "head";
export type PayPeriod = "annually" | "monthly" | "semimonthly" | "biweekly" | "weekly";

export const PERIODS_PER_YEAR: Record<PayPeriod, number> = {
  annually: 1,
  monthly: 12,
  semimonthly: 24,
  biweekly: 26,
  weekly: 52,
};

export const PERIOD_LABEL: Record<PayPeriod, string> = {
  annually: "per year",
  monthly: "per month",
  semimonthly: "per paycheck",
  biweekly: "per paycheck",
  weekly: "per week",
};

interface Bracket {
  rate: number;
  upTo: number;
}

// 2024 federal income tax brackets (taxable income thresholds).
const BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { rate: 0.1, upTo: 11600 },
    { rate: 0.12, upTo: 47150 },
    { rate: 0.22, upTo: 100525 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243725 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: Infinity },
  ],
  married: [
    { rate: 0.1, upTo: 23200 },
    { rate: 0.12, upTo: 94300 },
    { rate: 0.22, upTo: 201050 },
    { rate: 0.24, upTo: 383900 },
    { rate: 0.32, upTo: 487450 },
    { rate: 0.35, upTo: 731200 },
    { rate: 0.37, upTo: Infinity },
  ],
  head: [
    { rate: 0.1, upTo: 16550 },
    { rate: 0.12, upTo: 63100 },
    { rate: 0.22, upTo: 100500 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243700 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: Infinity },
  ],
};

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  head: 21900,
};

// 2024 FICA constants.
const SS_RATE = 0.062;
const SS_WAGE_BASE = 168600;
const MEDICARE_RATE = 0.0145;

export interface TakeHomePayInput {
  grossAnnualSalary: number;
  filingStatus: FilingStatus;
  stateTaxRatePct: number;
  pretaxDeductionsAnnual: number; // 401(k), HSA, health premiums, etc.
  payPeriod: PayPeriod;
}

export interface WithholdingSlice {
  label: string;
  value: number; // annual dollars
  color: string; // tailwind bg class for the legend dot
}

export interface TakeHomePayResult {
  grossAnnual: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  pretaxDeductions: number;
  totalWithheld: number;
  netAnnual: number;
  netPerPeriod: number;
  takeHomeRate: number; // net / gross
  payPeriod: PayPeriod;
  slices: WithholdingSlice[];
}

function federalTax(taxable: number, status: FilingStatus): number {
  const brackets = BRACKETS[status];
  let lower = 0;
  let tax = 0;
  for (const b of brackets) {
    if (taxable <= lower) break;
    const upper = Math.min(taxable, b.upTo);
    tax += (upper - lower) * b.rate;
    lower = b.upTo;
  }
  return tax;
}

export function computeTakeHomePay(input: TakeHomePayInput): TakeHomePayResult | null {
  const { grossAnnualSalary, filingStatus, stateTaxRatePct, pretaxDeductionsAnnual, payPeriod } = input;

  if (!Number.isFinite(grossAnnualSalary) || grossAnnualSalary <= 0) return null;
  if (!Number.isFinite(stateTaxRatePct) || stateTaxRatePct < 0) return null;
  if (!Number.isFinite(pretaxDeductionsAnnual) || pretaxDeductionsAnnual < 0) return null;
  if (!BRACKETS[filingStatus]) return null;
  if (pretaxDeductionsAnnual > grossAnnualSalary) return null;

  // Pre-tax deductions reduce income subject to federal and state income tax,
  // but FICA is calculated on the full gross wage.
  const wagesForIncomeTax = Math.max(0, grossAnnualSalary - pretaxDeductionsAnnual);
  const federalTaxable = Math.max(0, wagesForIncomeTax - STANDARD_DEDUCTION[filingStatus]);

  const fed = federalTax(federalTaxable, filingStatus);
  const state = wagesForIncomeTax * (stateTaxRatePct / 100);
  const socialSecurity = Math.min(grossAnnualSalary, SS_WAGE_BASE) * SS_RATE;
  const medicare = grossAnnualSalary * MEDICARE_RATE;

  const totalWithheld = fed + state + socialSecurity + medicare + pretaxDeductionsAnnual;
  const netAnnual = grossAnnualSalary - totalWithheld;
  const netPerPeriod = netAnnual / PERIODS_PER_YEAR[payPeriod];
  const takeHomeRate = grossAnnualSalary > 0 ? netAnnual / grossAnnualSalary : 0;

  const slices: WithholdingSlice[] = [
    { label: "Take-home pay", value: netAnnual, color: "bg-orange-500" },
    { label: "Federal tax", value: fed, color: "bg-orange-300" },
    { label: "State tax", value: state, color: "bg-amber-300" },
    { label: "Social Security", value: socialSecurity, color: "bg-zinc-400" },
    { label: "Medicare", value: medicare, color: "bg-zinc-300" },
    { label: "Pre-tax deductions", value: pretaxDeductionsAnnual, color: "bg-zinc-200" },
  ].filter((s) => s.value > 0.5);

  return {
    grossAnnual: grossAnnualSalary,
    federalTax: fed,
    stateTax: state,
    socialSecurity,
    medicare,
    pretaxDeductions: pretaxDeductionsAnnual,
    totalWithheld,
    netAnnual,
    netPerPeriod,
    takeHomeRate,
    payPeriod,
    slices,
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
