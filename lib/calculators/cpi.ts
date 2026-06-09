// Pure logic for the CPI (Consumer Price Index) Calculator.
// Uses the standard inflation adjustment: a value in a start period is scaled
// by the ratio of the end CPI to the start CPI to express it in the prices of
// the end period. Adjusted = Amount * (endCPI / startCPI).

export interface CPIInput {
  amount: number; // dollar amount in the start year
  startCPI: number; // CPI index value for the start year
  endCPI: number; // CPI index value for the end year
}

export interface CPIResult {
  adjustedAmount: number; // amount expressed in end-year dollars
  totalInflationPct: number; // cumulative price change between the two periods
  changeAmount: number; // adjustedAmount - amount
}

export function computeCPI(input: CPIInput): CPIResult | null {
  const { amount, startCPI, endCPI } = input;

  if (!Number.isFinite(amount)) return null;
  if (!Number.isFinite(startCPI) || startCPI <= 0) return null;
  if (!Number.isFinite(endCPI) || endCPI <= 0) return null;

  const ratio = endCPI / startCPI;
  const adjustedAmount = amount * ratio;
  const totalInflationPct = (ratio - 1) * 100;
  const changeAmount = adjustedAmount - amount;

  return { adjustedAmount, totalInflationPct, changeAmount };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
