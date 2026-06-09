// Pure logic for the Loan Eligibility Calculator.
// Estimates the maximum loan amount you may qualify for based on your monthly
// income, existing debt payments, the lender's allowed debt-to-income ratio,
// the interest rate and the loan term. It inverts the standard EMI formula to
// solve for the largest principal that fits the affordable monthly payment.

export interface LoanEligibilityInput {
  monthlyIncome: number;
  existingDebt: number; // current monthly debt payments
  maxDtiPct: number; // lender's max total debt-to-income ratio
  annualRatePct: number;
  termYears: number;
}

export interface LoanEligibilityResult {
  affordablePayment: number; // monthly payment available for this new loan
  eligibleAmount: number; // max principal that fits the affordable payment
  totalPayable: number; // principal + interest over the term
  totalInterest: number;
}

export function computeLoanEligibility(
  input: LoanEligibilityInput,
): LoanEligibilityResult | null {
  const { monthlyIncome, existingDebt, maxDtiPct, annualRatePct, termYears } = input;

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (existingDebt < 0 || maxDtiPct < 0 || annualRatePct < 0) return null;

  const maxTotalPayment = monthlyIncome * (maxDtiPct / 100);
  const affordablePayment = Math.max(0, maxTotalPayment - existingDebt);

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const eligibleAmount =
    affordablePayment === 0
      ? 0
      : r > 0
        ? (affordablePayment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
        : affordablePayment * n;

  const totalPayable = affordablePayment * n;
  const totalInterest = Math.max(0, totalPayable - eligibleAmount);

  return { affordablePayment, eligibleAmount, totalPayable, totalInterest };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
