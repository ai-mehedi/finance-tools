// Pure logic for the Loan Calculator.
// Computes the fixed monthly payment on an amortizing loan from the principal,
// the annual interest rate and the term in years, then derives the total paid
// and the total interest. Also builds a per-year remaining-balance schedule for
// an optional bar chart of how the balance is paid down over the life of the loan.

export interface LoanInput {
  amount: number; // principal borrowed
  annualRatePct: number; // nominal annual interest rate, percent
  years: number; // term in years
}

export interface LoanYearPoint {
  year: number; // 0..term, where year 0 is the original balance
  balance: number; // remaining principal at the end of that year
}

export interface LoanResult {
  monthlyPayment: number; // fixed monthly payment
  totalPaid: number; // monthlyPayment times the number of payments
  totalInterest: number; // totalPaid minus principal
  principal: number; // the amount borrowed, echoed back for the breakdown
  numberOfPayments: number; // total monthly payments over the term
  schedule: LoanYearPoint[]; // remaining balance at each year boundary
}

export function computeLoan(input: LoanInput): LoanResult | null {
  const { amount, annualRatePct, years } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12; // monthly interest rate
  const n = Math.round(years * 12); // total number of monthly payments
  if (n <= 0) return null;

  const monthlyPayment = r === 0 ? amount / n : (amount * r) / (1 - Math.pow(1 + r, -n));
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - amount;

  // Walk the amortization month by month, snapshotting the remaining balance at
  // each whole-year boundary so the chart shows one bar per year.
  const schedule: LoanYearPoint[] = [{ year: 0, balance: amount }];
  let balance = amount;
  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    balance = balance + interest - monthlyPayment;
    if (balance < 0) balance = 0;
    if (month % 12 === 0 || month === n) {
      schedule.push({ year: Math.ceil(month / 12), balance });
    }
  }

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    principal: amount,
    numberOfPayments: n,
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
