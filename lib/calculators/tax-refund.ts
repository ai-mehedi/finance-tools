// Pure logic for the Tax Refund Calculator.
// Estimates a US federal income tax refund (or amount owed) for a tax year by
// applying the standard deduction, the 2024 progressive federal brackets for the
// chosen filing status, and the child tax credit, then comparing the resulting
// tax to the amount already withheld from paychecks.

export type FilingStatus = "single" | "married" | "head";

export const FILING_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  married: "Married filing jointly",
  head: "Head of household",
};

// 2024 standard deduction by filing status.
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  head: 21900,
};

// 2024 federal income tax brackets: { upTo, rate }. The final band uses Infinity.
type Bracket = { upTo: number; rate: number };

const BRACKETS: Record<FilingStatus, Bracket[]> = {
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
  head: [
    { upTo: 16550, rate: 0.1 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

const CHILD_TAX_CREDIT = 2000; // per qualifying child, 2024

export interface TaxRefundInput {
  grossIncome: number;
  withheld: number;
  filingStatus: FilingStatus;
  dependents: number;
  deductionType: "standard" | "itemized";
  itemizedAmount: number;
}

export interface TaxBracketSlice {
  rate: number; // e.g. 0.12
  taxedAmount: number; // income taxed at this rate
  tax: number; // dollars of tax from this band
}

export interface TaxRefundResult {
  taxableIncome: number;
  deductionUsed: number;
  taxBeforeCredits: number;
  credits: number;
  taxAfterCredits: number;
  withheld: number;
  refund: number; // positive = refund, negative = amount owed
  effectiveRate: number; // tax after credits / gross income
  marginalRate: number; // top bracket reached
  slices: TaxBracketSlice[]; // per-bracket breakdown for charting
}

function taxFor(taxable: number, status: FilingStatus): { tax: number; slices: TaxBracketSlice[]; marginal: number } {
  let remaining = taxable;
  let lower = 0;
  let tax = 0;
  let marginal = 0;
  const slices: TaxBracketSlice[] = [];
  for (const b of BRACKETS[status]) {
    if (remaining <= 0) break;
    const band = Math.min(remaining, b.upTo - lower);
    const slabTax = band * b.rate;
    slices.push({ rate: b.rate, taxedAmount: band, tax: slabTax });
    tax += slabTax;
    marginal = b.rate;
    remaining -= band;
    lower = b.upTo;
  }
  return { tax, slices, marginal };
}

export function computeTaxRefund(input: TaxRefundInput): TaxRefundResult | null {
  const { grossIncome, withheld, filingStatus, dependents, deductionType, itemizedAmount } = input;

  if (!Number.isFinite(grossIncome) || grossIncome < 0) return null;
  if (!Number.isFinite(withheld) || withheld < 0) return null;
  if (!Number.isFinite(dependents) || dependents < 0) return null;

  const deductionUsed =
    deductionType === "itemized"
      ? Math.max(0, itemizedAmount || 0)
      : STANDARD_DEDUCTION[filingStatus];

  const taxableIncome = Math.max(0, grossIncome - deductionUsed);
  const { tax, slices, marginal } = taxFor(taxableIncome, filingStatus);

  const taxBeforeCredits = tax;
  const credits = Math.max(0, Math.round(dependents)) * CHILD_TAX_CREDIT;
  const taxAfterCredits = Math.max(0, taxBeforeCredits - credits);

  const refund = withheld - taxAfterCredits;
  const effectiveRate = grossIncome > 0 ? taxAfterCredits / grossIncome : 0;

  return {
    taxableIncome,
    deductionUsed,
    taxBeforeCredits,
    credits,
    taxAfterCredits,
    withheld,
    refund,
    effectiveRate,
    marginalRate: marginal,
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
