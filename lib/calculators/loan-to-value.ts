// Pure logic for the Loan to Value Calculator.
// Loan-to-value (LTV) = loan amount divided by appraised property value, shown
// as a percent. The complement is your equity share. We also estimate the down
// payment implied by the gap and flag the common LTV bands lenders care about,
// plus expose the split for a simple bar/donut.

export interface LoanToValueInput {
  propertyValue: number; // appraised or purchase value
  loanAmount: number; // outstanding or requested loan
}

export interface LoanToValueResult {
  ltvPct: number; // loan as a percent of value
  equityPct: number; // 100 minus LTV
  equityAmount: number; // value minus loan (down payment / owned share)
  band: string; // qualitative risk band
  pmiLikely: boolean; // true when LTV is above 80 percent
}

export function computeLoanToValue(
  input: LoanToValueInput,
): LoanToValueResult | null {
  const { propertyValue, loanAmount } = input;

  if (!Number.isFinite(propertyValue) || propertyValue <= 0) return null;
  if (!Number.isFinite(loanAmount) || loanAmount < 0) return null;

  const ltvPct = (loanAmount / propertyValue) * 100;
  const equityPct = 100 - ltvPct;
  const equityAmount = propertyValue - loanAmount;
  const pmiLikely = ltvPct > 80;

  let band: string;
  if (ltvPct <= 60) band = "Very low risk";
  else if (ltvPct <= 80) band = "Conventional range";
  else if (ltvPct <= 95) band = "High LTV";
  else band = "Above value";

  return { ltvPct, equityPct, equityAmount, band, pmiLikely };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const pctFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatPct = (n: number) => `${pctFmt.format(Number.isFinite(n) ? n : 0)}%`;

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
