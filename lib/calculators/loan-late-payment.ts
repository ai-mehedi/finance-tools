// Pure logic for the Loan Late Payment Calculator.
// Estimates the cost of paying a loan installment late. The total penalty is a
// flat late fee plus any percentage-based late fee, plus interest accrued on the
// overdue amount for the number of days it stays unpaid.

export interface LatePaymentInput {
  installmentAmount: number; // the payment that is overdue
  flatLateFee: number; // fixed late fee charged by the lender
  lateFeePct: number; // percentage late fee on the installment
  annualRatePct: number; // annual penalty interest rate
  daysLate: number; // number of days the payment is overdue
}

export interface LatePaymentResult {
  flatFee: number;
  percentFee: number;
  penaltyInterest: number;
  totalLateCost: number; // all penalties added together
  totalDue: number; // installment + all penalties
}

export function computeLatePayment(
  input: LatePaymentInput,
): LatePaymentResult | null {
  const { installmentAmount, flatLateFee, lateFeePct, annualRatePct, daysLate } =
    input;

  if (!Number.isFinite(installmentAmount) || installmentAmount <= 0) return null;
  if (flatLateFee < 0 || lateFeePct < 0 || annualRatePct < 0 || daysLate < 0)
    return null;
  if (!Number.isFinite(daysLate)) return null;

  const flatFee = flatLateFee;
  const percentFee = installmentAmount * (lateFeePct / 100);
  const dailyRate = annualRatePct / 100 / 365;
  const penaltyInterest = installmentAmount * dailyRate * daysLate;

  const totalLateCost = flatFee + percentFee + penaltyInterest;
  const totalDue = installmentAmount + totalLateCost;

  return { flatFee, percentFee, penaltyInterest, totalLateCost, totalDue };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
