// Pure logic for the Interest Only Loan Calculator.
// During the interest only period the borrower pays only interest, so the
// balance stays flat. After that period the loan amortizes over the remaining
// term using the standard payment formula. A yearly schedule of the remaining
// balance is exposed for charting.

export interface InterestOnlyInput {
  loanAmount: number;
  annualRatePct: number;
  interestOnlyYears: number;
  totalTermYears: number;
}

export interface InterestOnlyYearPoint {
  year: number;
  balance: number;
}

export interface InterestOnlyResult {
  loanAmount: number;
  interestOnlyPayment: number; // monthly payment during the IO period
  amortizingPayment: number; // monthly payment after the IO period
  interestOnlyInterest: number; // interest paid during the IO period
  totalInterest: number; // interest paid over the whole loan
  totalPaid: number; // principal + interest
  interestOnlyYears: number;
  totalTermYears: number;
  schedule: InterestOnlyYearPoint[];
}

export function computeInterestOnlyLoan(
  input: InterestOnlyInput,
): InterestOnlyResult | null {
  const { loanAmount, annualRatePct, interestOnlyYears, totalTermYears } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(totalTermYears) || totalTermYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(interestOnlyYears) || interestOnlyYears < 0) return null;
  if (interestOnlyYears >= totalTermYears) return null;

  const r = annualRatePct / 100 / 12;
  const ioMonths = Math.round(interestOnlyYears * 12);
  const totalMonths = Math.round(totalTermYears * 12);
  const amortMonths = totalMonths - ioMonths;

  const interestOnlyPayment = loanAmount * r;

  const amortizingPayment =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, amortMonths)) /
        (Math.pow(1 + r, amortMonths) - 1)
      : loanAmount / amortMonths;

  let balance = loanAmount;
  let cumInterest = 0;
  const schedule: InterestOnlyYearPoint[] = [{ year: 0, balance: loanAmount }];

  for (let m = 1; m <= totalMonths; m++) {
    const interest = balance * r;
    cumInterest += interest;
    if (m > ioMonths) {
      let principal = amortizingPayment - interest;
      if (principal > balance) principal = balance;
      balance = Math.max(0, balance - principal);
    }
    if (m % 12 === 0 || m === totalMonths) {
      schedule.push({ year: m / 12, balance });
    }
  }

  const interestOnlyInterest = interestOnlyPayment * ioMonths;
  const totalInterest = cumInterest;
  const totalPaid = loanAmount + totalInterest;

  return {
    loanAmount,
    interestOnlyPayment,
    amortizingPayment,
    interestOnlyInterest,
    totalInterest,
    totalPaid,
    interestOnlyYears,
    totalTermYears,
    schedule,
  };
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

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
