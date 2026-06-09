// Pure logic for the Annualized Return Calculator.
// Annualized return (CAGR) is the constant yearly growth rate that turns the
// beginning value into the ending value over the holding period:
// CAGR = (end / begin)^(1 / years) - 1.

export interface AnnualizedReturnInput {
  beginValue: number;
  endValue: number;
  years: number;
}

export interface AnnualizedReturnResult {
  totalReturnPct: number; // overall percentage gain or loss
  totalGain: number; // dollar gain or loss
  annualizedPct: number; // CAGR as a percentage
}

export function computeAnnualizedReturn(
  input: AnnualizedReturnInput,
): AnnualizedReturnResult | null {
  const { beginValue, endValue, years } = input;

  if (!Number.isFinite(beginValue) || beginValue <= 0) return null;
  if (!Number.isFinite(endValue) || endValue < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  const totalGain = endValue - beginValue;
  const totalReturnPct = (totalGain / beginValue) * 100;
  const annualized = Math.pow(endValue / beginValue, 1 / years) - 1;
  const annualizedPct = annualized * 100;

  return { totalReturnPct, totalGain, annualizedPct };
}

// Fixed en-US locale so server and client render identical strings.
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;
