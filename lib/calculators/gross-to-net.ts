// Pure logic for the Gross to Net Salary Calculator.
// Estimates take-home pay from a gross salary by subtracting a flat income
// tax rate, employee retirement contribution and other pre-tax/post-tax
// deductions. Returns annual and per-period figures plus a breakdown for a
// donut chart. This is a simplified estimate, not jurisdiction-specific
// withholding.

export type PayPeriod = "annual" | "monthly" | "biweekly" | "weekly";

export const PERIODS_PER_YEAR: Record<PayPeriod, number> = {
  annual: 1,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

export interface GrossToNetInput {
  grossAnnual: number;
  taxRatePct: number; // combined income tax estimate
  retirementPct: number; // employee contribution, treated pre-tax
  otherDeductions: number; // annual post-tax deductions (e.g. benefits)
  payPeriod: PayPeriod;
}

export interface GrossToNetSlice {
  label: string;
  value: number;
  color: string;
}

export interface GrossToNetResult {
  grossAnnual: number;
  retirement: number;
  taxableIncome: number;
  incomeTax: number;
  otherDeductions: number;
  netAnnual: number;
  netPerPeriod: number;
  grossPerPeriod: number;
  takeHomePct: number;
  periodLabel: string;
  slices: GrossToNetSlice[];
}

const PERIOD_LABEL: Record<PayPeriod, string> = {
  annual: "per year",
  monthly: "per month",
  biweekly: "per paycheck",
  weekly: "per week",
};

export function computeGrossToNet(input: GrossToNetInput): GrossToNetResult | null {
  const { grossAnnual, taxRatePct, retirementPct, otherDeductions, payPeriod } = input;

  if (!Number.isFinite(grossAnnual) || grossAnnual <= 0) return null;
  if (!Number.isFinite(taxRatePct) || taxRatePct < 0 || taxRatePct > 100) return null;
  if (!Number.isFinite(retirementPct) || retirementPct < 0 || retirementPct > 100) return null;
  if (!Number.isFinite(otherDeductions) || otherDeductions < 0) return null;

  const retirement = grossAnnual * (retirementPct / 100);
  const taxableIncome = Math.max(grossAnnual - retirement, 0);
  const incomeTax = taxableIncome * (taxRatePct / 100);
  const netAnnual = Math.max(grossAnnual - retirement - incomeTax - otherDeductions, 0);

  const per = PERIODS_PER_YEAR[payPeriod];
  const netPerPeriod = netAnnual / per;
  const grossPerPeriod = grossAnnual / per;
  const takeHomePct = (netAnnual / grossAnnual) * 100;

  const slices: GrossToNetSlice[] = [
    { label: "Take-home pay", value: netAnnual, color: "#f97316" },
    { label: "Income tax", value: incomeTax, color: "#fb923c" },
    { label: "Retirement", value: retirement, color: "#fdba74" },
    { label: "Other deductions", value: otherDeductions, color: "#a1a1aa" },
  ].filter((s) => s.value > 0);

  return {
    grossAnnual,
    retirement,
    taxableIncome,
    incomeTax,
    otherDeductions,
    netAnnual,
    netPerPeriod,
    grossPerPeriod,
    takeHomePct,
    periodLabel: PERIOD_LABEL[payPeriod],
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
