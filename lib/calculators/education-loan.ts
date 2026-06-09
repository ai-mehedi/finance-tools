// Pure logic for the Education Loan EMI Calculator.
// Computes the equated monthly installment (EMI) using the standard amortizing
// loan formula EMI = P * r * (1+r)^n / ((1+r)^n - 1), where r is the monthly
// rate and n is the number of monthly payments. Also builds a yearly schedule
// of the remaining balance for charting.

export interface EducationLoanInput {
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
}

export interface EducationLoanYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by end of year
  principalPaid: number; // cumulative principal paid by end of year
}

export interface EducationLoanResult {
  loanAmount: number;
  emi: number;
  totalInterest: number;
  totalPaid: number; // principal + interest over the loan
  termYears: number;
  schedule: EducationLoanYearPoint[];
}

export function computeEducationLoan(input: EducationLoanInput): EducationLoanResult | null {
  const { loanAmount, annualRatePct, termYears } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const emi = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;

  let balance = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const schedule: EducationLoanYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = emi - interest;
    if (principal > balance) principal = balance; // last payment guard
    balance = Math.max(0, balance - principal);
    cumInterest += interest;
    cumPrincipal += principal;
    if (m % 12 === 0 || m === n) {
      schedule.push({ year: m / 12, balance, interestPaid: cumInterest, principalPaid: cumPrincipal });
    }
  }

  const totalInterest = cumInterest;
  const totalPaid = loanAmount + totalInterest;

  return { loanAmount, emi, totalInterest, totalPaid, termYears, schedule };
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
