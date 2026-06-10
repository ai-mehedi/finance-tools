// Pure logic for the Loan Tenure Calculator.
// Given a loan amount, an annual interest rate and a fixed monthly payment (EMI),
// it solves for how many months it takes to clear the debt and exposes a yearly
// schedule of the outstanding balance for charting.

export interface LoanTenureInput {
  principal: number;
  annualRatePct: number;
  monthlyPayment: number;
}

export interface LoanTenureYearPoint {
  year: number;
  balance: number; // outstanding principal at end of year
  principalPaid: number; // cumulative principal repaid
  interestPaid: number; // cumulative interest paid
}

export interface LoanTenureResult {
  months: number;
  years: number;
  totalPaid: number;
  totalInterest: number;
  monthlyPayment: number;
  schedule: LoanTenureYearPoint[];
}

// Maximum months we will simulate before declaring the payment too small.
const MAX_MONTHS = 1200; // 100 years

export function computeLoanTenure(input: LoanTenureInput): LoanTenureResult | null {
  const { principal, annualRatePct, monthlyPayment } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;

  // The payment must at least cover the first month's interest, otherwise the
  // balance never falls and the loan is never repaid.
  const firstInterest = principal * monthlyRate;
  if (monthlyRate > 0 && monthlyPayment <= firstInterest) return null;

  let balance = principal;
  let cumPrincipal = 0;
  let cumInterest = 0;
  let months = 0;

  const schedule: LoanTenureYearPoint[] = [
    { year: 0, balance: principal, principalPaid: 0, interestPaid: 0 },
  ];

  while (balance > 0 && months < MAX_MONTHS) {
    const interest = balance * monthlyRate;
    let principalPart = monthlyPayment - interest;
    if (principalPart > balance) principalPart = balance; // final smaller payment
    balance -= principalPart;
    cumPrincipal += principalPart;
    cumInterest += interest;
    months += 1;

    if (months % 12 === 0 || balance <= 0) {
      schedule.push({
        year: months / 12,
        balance: Math.max(balance, 0),
        principalPaid: cumPrincipal,
        interestPaid: cumInterest,
      });
    }
  }

  if (months >= MAX_MONTHS && balance > 0) return null;

  const totalPaid = cumPrincipal + cumInterest;

  return {
    months,
    years: months / 12,
    totalPaid,
    totalInterest: cumInterest,
    monthlyPayment,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

export function formatTenure(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} ${y === 1 ? "year" : "years"}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? "month" : "months"}`);
  return parts.join(" ") || "0 months";
}
