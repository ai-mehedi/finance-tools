// Pure logic for the Income Tax Calculator.
// Estimates U.S. federal income tax using the 2024 progressive bracket
// schedule for the chosen filing status, after subtracting the standard
// deduction from gross income. Returns a per-bracket breakdown for charting.

export type FilingStatus = "single" | "married" | "head";

export interface TaxBracket {
  rate: number; // marginal rate, e.g. 0.22 for 22%
  upTo: number; // upper bound of this bracket (Infinity for the top)
}

// 2024 federal income tax brackets (taxable income thresholds).
export const BRACKETS: Record<FilingStatus, TaxBracket[]> = {
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

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  head: 21900,
};

export interface IncomeTaxInput {
  grossIncome: number;
  filingStatus: FilingStatus;
  extraDeductions: number; // additional pre-tax deductions beyond the standard one
}

export interface BracketShare {
  rate: number;
  taxableInBracket: number; // dollars of income taxed at this rate
  taxFromBracket: number; // tax owed from this slice
}

export interface IncomeTaxResult {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveRate: number; // tax / gross income
  marginalRate: number; // rate of the top bracket reached
  shares: BracketShare[];
}

export function computeIncomeTax(input: IncomeTaxInput): IncomeTaxResult | null {
  const { grossIncome, filingStatus, extraDeductions } = input;

  if (!Number.isFinite(grossIncome) || grossIncome < 0) return null;
  if (!Number.isFinite(extraDeductions) || extraDeductions < 0) return null;
  if (!BRACKETS[filingStatus]) return null;

  const deduction = STANDARD_DEDUCTION[filingStatus] + extraDeductions;
  const taxableIncome = Math.max(0, grossIncome - deduction);

  const brackets = BRACKETS[filingStatus];
  let lower = 0;
  let totalTax = 0;
  let marginalRate = brackets[0].rate;
  const shares: BracketShare[] = [];

  for (const b of brackets) {
    if (taxableIncome <= lower) break;
    const upper = Math.min(taxableIncome, b.upTo);
    const taxableInBracket = upper - lower;
    if (taxableInBracket > 0) {
      const taxFromBracket = taxableInBracket * b.rate;
      totalTax += taxFromBracket;
      marginalRate = b.rate;
      shares.push({ rate: b.rate, taxableInBracket, taxFromBracket });
    }
    lower = b.upTo;
  }

  const afterTaxIncome = grossIncome - totalTax;
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;

  return {
    grossIncome,
    taxableIncome,
    totalTax,
    afterTaxIncome,
    effectiveRate,
    marginalRate,
    shares,
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
