// Pure logic for the Withholding Tax Calculator.
// Estimates how much income tax is withheld from each paycheck and how that
// compares with the tax actually owed on annualized income, so a worker can see
// whether they are heading toward a refund or a balance due. Uses simplified,
// illustrative progressive brackets on taxable pay (gross minus pre-tax items
// and the standard deduction), not a substitute for an official W-4 worksheet.

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly" | "annually";

export const PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  annually: 1,
};

export type FilingStatus = "single" | "married";

// Illustrative annual brackets (marginal rates) by filing status.
const BRACKETS: Record<FilingStatus, { upTo: number; rate: number }[]> = {
  single: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  married: [
    { upTo: 23200, rate: 0.1 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
};

export interface WithholdingInput {
  grossPerPeriod: number; // gross pay each period
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  allowances: number; // extra deduction units, each worth a fixed amount
  preTaxPerPeriod: number; // 401(k), health premiums, etc. per period
  extraPerPeriod: number; // additional flat withholding requested per period
}

export interface WithholdingResult {
  perPeriodWithholding: number; // tax withheld each paycheck
  netPerPeriod: number; // take-home each paycheck
  annualGross: number;
  annualTaxable: number;
  annualTaxOwed: number; // tax actually due on annualized income
  annualWithheld: number; // total withheld across the year
  effectiveRatePct: number; // annual tax owed divided by annual gross
  marginalRatePct: number; // top bracket rate reached
  refundOrDue: number; // positive = refund, negative = balance due
  brackets: { rate: number; taxed: number; tax: number }[]; // for charting
}

const ALLOWANCE_VALUE = 4300; // annual deduction per allowance

function taxOnTaxable(taxable: number, status: FilingStatus) {
  const brackets = BRACKETS[status];
  let remaining = Math.max(0, taxable);
  let lower = 0;
  let tax = 0;
  let marginal = brackets[0].rate;
  const breakdown: { rate: number; taxed: number; tax: number }[] = [];

  for (const b of brackets) {
    if (remaining <= 0) break;
    const span = b.upTo - lower;
    const taxed = Math.min(remaining, span);
    if (taxed > 0) {
      const t = taxed * b.rate;
      tax += t;
      marginal = b.rate;
      breakdown.push({ rate: b.rate, taxed, tax: t });
    }
    remaining -= taxed;
    lower = b.upTo;
  }

  return { tax, marginal, breakdown };
}

export function computeWithholding(input: WithholdingInput): WithholdingResult | null {
  const { grossPerPeriod, payFrequency, filingStatus, allowances, preTaxPerPeriod, extraPerPeriod } =
    input;

  if (!Number.isFinite(grossPerPeriod) || grossPerPeriod <= 0) return null;
  if (!Number.isFinite(allowances) || allowances < 0) return null;
  if (preTaxPerPeriod < 0 || extraPerPeriod < 0) return null;
  if (preTaxPerPeriod >= grossPerPeriod) return null;

  const periods = PERIODS_PER_YEAR[payFrequency];
  const annualGross = grossPerPeriod * periods;
  const annualPreTax = preTaxPerPeriod * periods;

  const deduction =
    STANDARD_DEDUCTION[filingStatus] + allowances * ALLOWANCE_VALUE + annualPreTax;
  const annualTaxable = Math.max(0, annualGross - deduction);

  const { tax, marginal, breakdown } = taxOnTaxable(annualTaxable, filingStatus);

  const annualTaxOwed = tax;
  const annualExtra = extraPerPeriod * periods;
  // Withholding tracks the tax owed plus any requested extra flat amount.
  const annualWithheld = annualTaxOwed + annualExtra;

  const perPeriodWithholding = annualWithheld / periods;
  const netPerPeriod = grossPerPeriod - preTaxPerPeriod - perPeriodWithholding;
  const effectiveRatePct = annualGross > 0 ? (annualTaxOwed / annualGross) * 100 : 0;
  const refundOrDue = annualWithheld - annualTaxOwed; // > 0 means refund

  return {
    perPeriodWithholding,
    netPerPeriod,
    annualGross,
    annualTaxable,
    annualTaxOwed,
    annualWithheld,
    effectiveRatePct,
    marginalRatePct: marginal * 100,
    refundOrDue,
    brackets: breakdown,
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
