// Pure logic for the Tax Bracket Calculator.
// Given a taxable income and filing status, it walks the 2024 federal income
// tax brackets, computes the tax owed in each band, and reports the marginal
// (top) bracket and the effective (blended) rate. Returns a per-bracket
// schedule so the widget can chart how income fills each band.

export type FilingStatus = "single" | "married" | "head";

export const STATUS_LABEL: Record<FilingStatus, string> = {
  single: "Single",
  married: "Married filing jointly",
  head: "Head of household",
};

interface Bracket {
  rate: number;
  from: number;
  upTo: number;
}

// 2024 federal income tax brackets (taxable-income thresholds).
const BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { rate: 0.1, from: 0, upTo: 11600 },
    { rate: 0.12, from: 11600, upTo: 47150 },
    { rate: 0.22, from: 47150, upTo: 100525 },
    { rate: 0.24, from: 100525, upTo: 191950 },
    { rate: 0.32, from: 191950, upTo: 243725 },
    { rate: 0.35, from: 243725, upTo: 609350 },
    { rate: 0.37, from: 609350, upTo: Infinity },
  ],
  married: [
    { rate: 0.1, from: 0, upTo: 23200 },
    { rate: 0.12, from: 23200, upTo: 94300 },
    { rate: 0.22, from: 94300, upTo: 201050 },
    { rate: 0.24, from: 201050, upTo: 383900 },
    { rate: 0.32, from: 383900, upTo: 487450 },
    { rate: 0.35, from: 487450, upTo: 731200 },
    { rate: 0.37, from: 731200, upTo: Infinity },
  ],
  head: [
    { rate: 0.1, from: 0, upTo: 16550 },
    { rate: 0.12, from: 16550, upTo: 63100 },
    { rate: 0.22, from: 63100, upTo: 100500 },
    { rate: 0.24, from: 100500, upTo: 191950 },
    { rate: 0.32, from: 191950, upTo: 243700 },
    { rate: 0.35, from: 243700, upTo: 609350 },
    { rate: 0.37, from: 609350, upTo: Infinity },
  ],
};

export interface TaxBracketInput {
  taxableIncome: number;
  filingStatus: FilingStatus;
}

export interface BracketRow {
  rate: number; // e.g. 0.22
  rangeFrom: number;
  rangeTo: number; // capped at income for display of "amount in bracket"
  incomeInBracket: number; // dollars of income taxed at this rate
  taxInBracket: number; // dollars of tax from this band
  isMarginal: boolean; // the top band the income reaches
}

export interface TaxBracketResult {
  taxableIncome: number;
  totalTax: number;
  afterTaxIncome: number;
  marginalRate: number; // top bracket rate
  effectiveRate: number; // totalTax / taxableIncome
  rows: BracketRow[];
}

export function computeTaxBracket(input: TaxBracketInput): TaxBracketResult | null {
  const { taxableIncome, filingStatus } = input;

  if (!Number.isFinite(taxableIncome) || taxableIncome < 0) return null;
  const brackets = BRACKETS[filingStatus];
  if (!brackets) return null;

  let totalTax = 0;
  let marginalRate = 0;
  const rows: BracketRow[] = [];

  for (const b of brackets) {
    if (taxableIncome <= b.from) {
      // income does not reach this band; still record an empty row for the chart
      rows.push({
        rate: b.rate,
        rangeFrom: b.from,
        rangeTo: b.upTo,
        incomeInBracket: 0,
        taxInBracket: 0,
        isMarginal: false,
      });
      continue;
    }
    const upper = Math.min(taxableIncome, b.upTo);
    const incomeInBracket = upper - b.from;
    const taxInBracket = incomeInBracket * b.rate;
    totalTax += taxInBracket;
    marginalRate = b.rate;
    rows.push({
      rate: b.rate,
      rangeFrom: b.from,
      rangeTo: b.upTo,
      incomeInBracket,
      taxInBracket,
      isMarginal: false,
    });
  }

  // Flag the highest band that actually received income.
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].incomeInBracket > 0) {
      rows[i].isMarginal = true;
      break;
    }
  }

  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;
  const afterTaxIncome = taxableIncome - totalTax;

  return {
    taxableIncome,
    totalTax,
    afterTaxIncome,
    marginalRate,
    effectiveRate,
    rows,
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
