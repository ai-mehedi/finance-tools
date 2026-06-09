// Pure logic for the Cash Advance Fee Calculator. A credit card cash advance
// usually charges an upfront fee (a percentage of the amount, with a minimum)
// plus interest that starts accruing immediately at the cash advance APR, with
// no grace period. This estimates the fee, the interest until repayment and the
// total cost.

export interface CashAdvanceInput {
  amount: number; // cash advanced
  feePct: number; // cash advance fee percentage
  feeMin: number; // minimum fee in dollars
  aprPct: number; // cash advance APR
  daysUntilRepaid: number; // days before you pay it back
}

export interface CashAdvanceResult {
  fee: number;
  interest: number;
  totalCost: number; // fee + interest
  totalRepaid: number; // amount + fee + interest
  effectiveCostPct: number; // total cost as a percent of the amount
}

export function computeCashAdvance(input: CashAdvanceInput): CashAdvanceResult | null {
  const { amount, feePct, feeMin, aprPct, daysUntilRepaid } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (feePct < 0 || feeMin < 0 || aprPct < 0 || daysUntilRepaid < 0) return null;
  if (!Number.isFinite(daysUntilRepaid) || !Number.isFinite(aprPct)) return null;

  const percentFee = amount * (feePct / 100);
  const fee = Math.max(percentFee, feeMin);

  // Interest accrues from day one at the daily periodic rate, no grace period.
  const dailyRate = aprPct / 100 / 365;
  const interest = amount * dailyRate * daysUntilRepaid;

  const totalCost = fee + interest;
  const totalRepaid = amount + totalCost;
  const effectiveCostPct = (totalCost / amount) * 100;

  return { fee, interest, totalCost, totalRepaid, effectiveCostPct };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
