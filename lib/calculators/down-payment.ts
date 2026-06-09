// Pure logic for the Down Payment Calculator.
// Works out the down payment amount from a home price and a chosen percentage,
// the loan amount that remains, and whether private mortgage insurance is
// likely to apply (typically when the down payment is under 20%).

export interface DownPaymentInput {
  homePrice: number;
  downPaymentPct: number; // percent of home price put down
  closingCostPct: number; // estimated closing costs as percent of price
}

export interface DownPaymentResult {
  downPayment: number;
  loanAmount: number;
  closingCosts: number;
  cashNeeded: number; // down payment + closing costs
  loanToValuePct: number; // loan / price
  pmiLikely: boolean; // true when down payment under 20%
}

export function computeDownPayment(input: DownPaymentInput): DownPaymentResult | null {
  const { homePrice, downPaymentPct, closingCostPct } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return null;
  if (downPaymentPct < 0 || downPaymentPct > 100) return null;
  if (closingCostPct < 0) return null;

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = Math.max(0, homePrice - downPayment);
  const closingCosts = homePrice * (closingCostPct / 100);
  const cashNeeded = downPayment + closingCosts;
  const loanToValuePct = (loanAmount / homePrice) * 100;
  const pmiLikely = downPaymentPct < 20;

  return {
    downPayment,
    loanAmount,
    closingCosts,
    cashNeeded,
    loanToValuePct,
    pmiLikely,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
