// Pure logic for the Simple Interest Calculator.
// Simple interest is charged only on the original principal: I = P * r * t.

export interface SimpleInterestInput {
  principal: number;
  annualRatePct: number;
  years: number;
}

export interface SimpleInterestResult {
  interest: number;
  total: number; // principal + interest
}

export function computeSimpleInterest(input: SimpleInterestInput): SimpleInterestResult | null {
  const { principal, annualRatePct, years } = input;
  if (!Number.isFinite(principal) || principal < 0) return null;
  if (annualRatePct < 0 || years < 0) return null;
  if (!Number.isFinite(years) || !Number.isFinite(annualRatePct)) return null;

  const interest = principal * (annualRatePct / 100) * years;
  return { interest, total: principal + interest };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
