// Pure logic for the Student Loan Payoff Calculator.
// Amortizes a fixed-rate student loan month by month. Supports an optional extra
// monthly payment that is applied to principal, shortening the term and cutting
// total interest. Exposes a per-year schedule of the remaining balance for charting
// plus headline figures (months to payoff, total interest, interest saved).

export interface StudentLoanPayoffInput {
  balance: number; // current loan principal
  annualRatePct: number; // nominal annual interest rate
  monthlyPayment: number; // the scheduled minimum payment
  extraPayment: number; // additional amount paid toward principal each month
}

export interface PayoffYearPoint {
  year: number;
  balance: number; // remaining principal at the end of this year
  paid: number; // cumulative total paid so far
  interest: number; // cumulative interest paid so far
}

export interface StudentLoanPayoffResult {
  months: number; // months to fully repay with the chosen payment
  totalPaid: number;
  totalInterest: number;
  monthsBaseline: number; // months with no extra payment
  interestBaseline: number; // interest with no extra payment
  interestSaved: number; // baseline interest minus actual interest
  monthsSaved: number;
  payoffMonths: number; // alias of months for readability
  schedule: PayoffYearPoint[];
}

const MAX_MONTHS = 1200; // 100 years guard

// Amortize a loan and return months + total interest. Returns null if the payment
// cannot cover the first month of interest (the balance would grow forever).
function amortize(
  balance: number,
  monthlyRate: number,
  payment: number,
): { months: number; totalInterest: number; totalPaid: number; yearly: { balance: number; paidCum: number; interestCum: number }[] } | null {
  if (balance <= 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0, yearly: [] };
  }
  // If interest accrues faster than the payment can cover, the loan never amortizes.
  if (monthlyRate > 0 && payment <= balance * monthlyRate) return null;

  let bal = balance;
  let interestCum = 0;
  let paidCum = 0;
  const yearly: { balance: number; paidCum: number; interestCum: number }[] = [];
  let m = 0;

  while (bal > 0 && m < MAX_MONTHS) {
    m++;
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal > bal) principal = bal; // final partial payment
    const thisPayment = principal + interest;
    bal = bal - principal;
    interestCum += interest;
    paidCum += thisPayment;
    if (m % 12 === 0 || bal <= 0) {
      yearly.push({ balance: Math.max(0, bal), paidCum, interestCum });
    }
  }

  return { months: m, totalInterest: interestCum, totalPaid: paidCum, yearly };
}

export function computeStudentLoanPayoff(
  input: StudentLoanPayoffInput,
): StudentLoanPayoffResult | null {
  const { balance, annualRatePct, monthlyPayment, extraPayment } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (!Number.isFinite(extraPayment) || extraPayment < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const totalPayment = monthlyPayment + extraPayment;

  const actual = amortize(balance, monthlyRate, totalPayment);
  if (!actual) return null;

  // Baseline = the minimum payment only, for the "interest saved" comparison.
  const base = amortize(balance, monthlyRate, monthlyPayment) ?? {
    months: MAX_MONTHS,
    totalInterest: actual.totalInterest,
    totalPaid: actual.totalPaid,
    yearly: [],
  };

  const schedule: PayoffYearPoint[] = [
    { year: 0, balance, paid: 0, interest: 0 },
    ...actual.yearly.map((p, i) => ({
      year: i + 1,
      balance: p.balance,
      paid: p.paidCum,
      interest: p.interestCum,
    })),
  ];

  return {
    months: actual.months,
    totalPaid: actual.totalPaid,
    totalInterest: actual.totalInterest,
    monthsBaseline: base.months,
    interestBaseline: base.totalInterest,
    interestSaved: Math.max(0, base.totalInterest - actual.totalInterest),
    monthsSaved: Math.max(0, base.months - actual.months),
    payoffMonths: actual.months,
    schedule,
  };
}

export function formatMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr${y === 1 ? "" : "s"}`);
  if (m > 0) parts.push(`${m} mo${m === 1 ? "" : "s"}`);
  return parts.join(" ") || "0 months";
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
