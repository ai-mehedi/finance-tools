// Pure logic for the Business Loan Calculator. Computes the monthly payment for
// a fixed-rate amortizing business loan, the total interest and total repayment,
// the cost of an optional one-time origination fee, and a yearly amortization
// schedule for charting the remaining balance.

export interface BusinessLoanInput {
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
  originationFeePct?: number; // one-time fee charged on the loan amount, %
}

export interface BusinessLoanYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by end of year
  principalPaid: number; // cumulative principal paid by end of year
}

export interface BusinessLoanResult {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number; // principal + interest over the loan
  originationFee: number; // one-time dollar fee
  effectiveCost: number; // total interest + origination fee
  payoffYears: number;
  schedule: BusinessLoanYearPoint[];
}

export function computeBusinessLoan(input: BusinessLoanInput): BusinessLoanResult | null {
  const { loanAmount, annualRatePct, termYears, originationFeePct = 0 } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(originationFeePct) || originationFeePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyPayment =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;

  // Amortize month by month to build the yearly schedule and total interest.
  let balance = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const schedule: BusinessLoanYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance; // last payment guard
    balance = Math.max(0, balance - principal);
    cumInterest += interest;
    cumPrincipal += principal;
    if (m % 12 === 0 || m === n) {
      schedule.push({
        year: m / 12,
        balance,
        interestPaid: cumInterest,
        principalPaid: cumPrincipal,
      });
    }
  }

  const totalInterest = cumInterest;
  const totalRepayment = loanAmount + totalInterest;
  const originationFee = loanAmount * (originationFeePct / 100);
  const effectiveCost = totalInterest + originationFee;

  return {
    loanAmount,
    monthlyPayment,
    totalInterest,
    totalRepayment,
    originationFee,
    effectiveCost,
    payoffYears: termYears,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
