// Pure logic for the Personal Loan Calculator.
// Standard amortizing fixed-rate loan. Monthly payment from the annuity formula:
//   M = P * (i * (1 + i)^n) / ((1 + i)^n - 1)
// where i is the monthly rate and n the number of payments. Builds a full
// amortization schedule and a per-year aggregate used to chart the falling
// balance against principal and interest paid.

export interface PersonalLoanInput {
  amount: number; // principal borrowed
  annualRatePct: number; // nominal annual interest rate
  termYears: number; // loan term in years
  extraMonthly: number; // optional extra payment toward principal each month
}

export interface LoanYearPoint {
  year: number;
  balance: number; // remaining principal at year end
  principalPaid: number; // cumulative principal repaid
  interestPaid: number; // cumulative interest paid
}

export interface PersonalLoanResult {
  monthlyPayment: number; // scheduled payment (excludes any extra)
  totalPaid: number; // principal + interest actually paid
  totalInterest: number;
  payoffMonths: number; // months until the balance reaches zero
  amount: number;
  schedule: LoanYearPoint[];
}

export function computePersonalLoan(
  input: PersonalLoanInput
): PersonalLoanResult | null {
  const { amount, annualRatePct, termYears, extraMonthly } = input;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(extraMonthly) || extraMonthly < 0) return null;

  const n = Math.round(termYears * 12);
  const i = annualRatePct / 100 / 12;

  const monthlyPayment =
    i === 0
      ? amount / n
      : (amount * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1);

  const schedule: LoanYearPoint[] = [
    { year: 0, balance: amount, principalPaid: 0, interestPaid: 0 },
  ];

  let balance = amount;
  let cumPrincipal = 0;
  let cumInterest = 0;
  let month = 0;
  const maxMonths = n + 1200; // safety cap so extra payments can't loop forever

  while (balance > 0.005 && month < maxMonths) {
    month++;
    const interest = balance * i;
    let principal = monthlyPayment - interest + extraMonthly;
    if (principal > balance) principal = balance;
    if (principal < 0) principal = 0; // guard against negative amortization

    balance -= principal;
    cumPrincipal += principal;
    cumInterest += interest;

    if (month % 12 === 0 || balance <= 0.005) {
      schedule.push({
        year: month / 12,
        balance: Math.max(0, balance),
        principalPaid: cumPrincipal,
        interestPaid: cumInterest,
      });
    }
  }

  const totalInterest = cumInterest;
  const totalPaid = cumPrincipal + cumInterest;

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    payoffMonths: month,
    amount,
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
