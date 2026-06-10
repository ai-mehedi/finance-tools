// Pure logic for the Paycheck Calculator.
// Estimates take-home (net) pay per paycheck from an annual gross salary.
// Subtracts pre-tax (401k) contributions, then applies a flat federal effective
// rate, a state rate, and the employee share of FICA (Social Security 6.2% up to
// a wage base, plus Medicare 1.45%). Returns a per-category breakdown for a donut.

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly" | "annually";

export const PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  annually: 1,
};

// 2024 Social Security wage base.
const SS_WAGE_BASE = 168_600;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;

export interface PaycheckInput {
  annualSalary: number;
  payFrequency: PayFrequency;
  preTaxPct: number; // e.g. 401(k) contribution as percent of gross
  federalRatePct: number; // effective federal rate
  stateRatePct: number;
}

export interface PaycheckSlice {
  label: string;
  annual: number;
  perPaycheck: number;
}

export interface PaycheckResult {
  grossPerPaycheck: number;
  netPerPaycheck: number;
  annualNet: number;
  annualGross: number;
  takeHomePct: number; // net as a share of gross
  slices: PaycheckSlice[]; // net + each deduction, for the donut
}

export function computePaycheck(input: PaycheckInput): PaycheckResult | null {
  const { annualSalary, payFrequency, preTaxPct, federalRatePct, stateRatePct } = input;

  if (!Number.isFinite(annualSalary) || annualSalary <= 0) return null;
  if (preTaxPct < 0 || preTaxPct >= 100) return null;
  if (federalRatePct < 0 || stateRatePct < 0) return null;
  if (!Number.isFinite(federalRatePct) || !Number.isFinite(stateRatePct)) return null;

  const periods = PERIODS_PER_YEAR[payFrequency];

  const preTax = annualSalary * (preTaxPct / 100);
  const taxableWages = annualSalary - preTax;

  // FICA is levied on gross wages (pre-tax 401k is NOT exempt from FICA).
  const socialSecurity = Math.min(annualSalary, SS_WAGE_BASE) * SS_RATE;
  const medicare = annualSalary * MEDICARE_RATE;

  const federal = taxableWages * (federalRatePct / 100);
  const state = taxableWages * (stateRatePct / 100);

  const totalDeductions = preTax + socialSecurity + medicare + federal + state;
  const annualNet = annualSalary - totalDeductions;

  const slices: PaycheckSlice[] = [
    { label: "Take-home pay", annual: annualNet, perPaycheck: annualNet / periods },
    { label: "Federal tax", annual: federal, perPaycheck: federal / periods },
    { label: "State tax", annual: state, perPaycheck: state / periods },
    { label: "Social Security", annual: socialSecurity, perPaycheck: socialSecurity / periods },
    { label: "Medicare", annual: medicare, perPaycheck: medicare / periods },
    { label: "Pre-tax (401k)", annual: preTax, perPaycheck: preTax / periods },
  ].filter((s) => s.annual > 0 || s.label === "Take-home pay");

  return {
    grossPerPaycheck: annualSalary / periods,
    netPerPaycheck: annualNet / periods,
    annualNet,
    annualGross: annualSalary,
    takeHomePct: (annualNet / annualSalary) * 100,
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
