// Pure logic for the Credit Builder Loan Calculator.
// A credit builder loan holds the borrowed amount in a locked savings account
// while you make fixed monthly payments. The payment is a standard amortizing
// loan payment, M = P*r*(1+r)^n / ((1+r)^n - 1), with r the monthly rate and n
// the number of months. We also build a per-month schedule of the amount you
// have saved up so far for charting.

export interface CreditBuilderInput {
  loanAmount: number; // amount held in the locked account
  annualRatePct: number; // APR charged on the loan
  termMonths: number; // number of monthly payments
}

export interface CreditBuilderMonthPoint {
  month: number;
  saved: number; // principal repaid so far (what you get back at the end)
  balance: number; // outstanding loan balance
}

export interface CreditBuilderResult {
  monthlyPayment: number;
  totalPaid: number; // sum of all monthly payments
  totalInterest: number; // cost of building credit
  amountReturned: number; // the original loan amount released at the end
  schedule: CreditBuilderMonthPoint[];
}

export function computeCreditBuilderLoan(
  input: CreditBuilderInput
): CreditBuilderResult | null {
  const { loanAmount, annualRatePct, termMonths } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return null;
  if (annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termMonths);

  const monthlyPayment =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;

  let balance = loanAmount;
  let principalPaid = 0;
  let interestPaid = 0;

  const schedule: CreditBuilderMonthPoint[] = [
    { month: 0, saved: 0, balance: loanAmount },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance = Math.max(0, balance - principal);
    principalPaid += principal;
    interestPaid += interest;
    schedule.push({ month: m, saved: principalPaid, balance });
  }

  const totalPaid = monthlyPayment * n;
  const totalInterest = interestPaid;

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    amountReturned: loanAmount,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD0 = (n: number) => usd0.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
