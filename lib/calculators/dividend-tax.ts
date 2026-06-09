// Pure logic for the Dividend Tax Calculator.
// Estimates US federal tax on dividend income. Qualified dividends are taxed at
// the long-term capital gains rates (0%, 15% or 20%) based on taxable income and
// filing status, while ordinary (non-qualified) dividends are taxed at your
// marginal ordinary income rate, which the user supplies.

export type FilingStatus = "single" | "married" | "head";

export interface DividendTaxInput {
  dividendIncome: number;
  qualified: boolean;
  taxableIncome: number; // total taxable income, sets the bracket for qualified dividends
  filingStatus: FilingStatus;
  ordinaryRatePct: number; // marginal rate used for non-qualified dividends
}

export interface DividendTaxResult {
  grossDividend: number;
  effectiveRatePct: number;
  taxOwed: number;
  netDividend: number;
}

// 2024 long-term capital gains / qualified dividend brackets (taxable income).
const QUALIFIED_BRACKETS: Record<FilingStatus, { zero: number; fifteen: number }> = {
  single: { zero: 47025, fifteen: 518900 },
  married: { zero: 94050, fifteen: 583750 },
  head: { zero: 63000, fifteen: 551350 },
};

function qualifiedRate(taxableIncome: number, status: FilingStatus): number {
  const b = QUALIFIED_BRACKETS[status];
  if (taxableIncome <= b.zero) return 0;
  if (taxableIncome <= b.fifteen) return 0.15;
  return 0.2;
}

export function computeDividendTax(input: DividendTaxInput): DividendTaxResult | null {
  const { dividendIncome, qualified, taxableIncome, filingStatus, ordinaryRatePct } = input;

  if (!Number.isFinite(dividendIncome) || dividendIncome < 0) return null;
  if (!Number.isFinite(taxableIncome) || taxableIncome < 0) return null;
  if (!Number.isFinite(ordinaryRatePct) || ordinaryRatePct < 0 || ordinaryRatePct > 100) {
    return null;
  }

  const rate = qualified
    ? qualifiedRate(taxableIncome, filingStatus)
    : ordinaryRatePct / 100;

  const taxOwed = dividendIncome * rate;
  const netDividend = dividendIncome - taxOwed;

  return {
    grossDividend: dividendIncome,
    effectiveRatePct: rate * 100,
    taxOwed,
    netDividend,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
