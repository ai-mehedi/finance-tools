// Pure logic for the Bridge Loan Calculator.
// A bridge loan is a short-term, usually interest-only loan that covers the gap
// before longer-term financing. This computes the monthly interest payment, the
// total interest over the term, any origination fee, and the final payoff.

export interface BridgeLoanInput {
  loanAmount: number;
  annualRatePct: number;
  termMonths: number;
  originationFeePct: number; // upfront fee as a percent of the loan
}

export interface BridgeLoanResult {
  monthlyInterest: number; // interest-only monthly payment
  totalInterest: number; // interest over the full term
  originationFee: number;
  totalCost: number; // interest + fee (the cost of borrowing)
  payoffAmount: number; // principal repaid at the end of the term
  totalRepaid: number; // principal + interest + fee
}

export function computeBridgeLoan(input: BridgeLoanInput): BridgeLoanResult | null {
  const { loanAmount, annualRatePct, termMonths, originationFeePct } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return null;
  if (annualRatePct < 0 || originationFeePct < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const monthlyInterest = loanAmount * monthlyRate;
  const totalInterest = monthlyInterest * termMonths;
  const originationFee = loanAmount * (originationFeePct / 100);

  const totalCost = totalInterest + originationFee;
  const payoffAmount = loanAmount;
  const totalRepaid = loanAmount + totalInterest + originationFee;

  return {
    monthlyInterest,
    totalInterest,
    originationFee,
    totalCost,
    payoffAmount,
    totalRepaid,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
