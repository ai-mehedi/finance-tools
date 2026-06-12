// Pure logic for the Student Loan Calculator.
// Amortizes a student loan at a fixed annual rate over a chosen repayment term,
// optionally after a grace/deferment period during which interest accrues and is
// capitalized into the balance. Returns the monthly payment, total interest and
// total cost, plus a per-year balance schedule for charting.

export interface StudentLoanInput {
  principal: number;
  annualRatePct: number;
  termYears: number;
  graceMonths: number; // months of deferment before repayment starts
  capitalizeGraceInterest: boolean; // add accrued grace interest to the balance
}

export interface StudentLoanYearPoint {
  year: number;
  balance: number;
  principalPaid: number; // cumulative principal repaid by end of year
  interestPaid: number; // cumulative interest paid by end of year
}

export interface StudentLoanResult {
  monthlyPayment: number;
  startingBalance: number; // balance when repayment begins (after grace)
  graceInterest: number; // interest that accrued during grace
  totalInterest: number; // total interest over the life of the loan
  totalPaid: number; // total of all repayment-period payments
  payoffMonths: number; // grace months + repayment months
  schedule: StudentLoanYearPoint[];
}

export function computeStudentLoan(input: StudentLoanInput): StudentLoanResult | null {
  const { principal, annualRatePct, termYears, graceMonths, capitalizeGraceInterest } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(graceMonths) || graceMonths < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const grace = Math.round(graceMonths);

  // Interest that accrues during the grace period (simple monthly accrual).
  const graceInterest = principal * monthlyRate * grace;
  const startingBalance = capitalizeGraceInterest ? principal + graceInterest : principal;

  const n = Math.round(termYears * 12);

  // Standard amortized payment.
  const monthlyPayment =
    monthlyRate === 0
      ? startingBalance / n
      : (startingBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

  let balance = startingBalance;
  let cumPrincipal = 0;
  let cumInterest = 0;

  const schedule: StudentLoanYearPoint[] = [
    { year: 0, balance: startingBalance, principalPaid: 0, interestPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * monthlyRate;
    let principalPart = monthlyPayment - interest;
    if (principalPart > balance) principalPart = balance;
    balance -= principalPart;
    cumPrincipal += principalPart;
    cumInterest += interest;
    if (m % 12 === 0 || m === n) {
      schedule.push({
        year: m / 12,
        balance: Math.max(0, balance),
        principalPaid: cumPrincipal,
        interestPaid: cumInterest,
      });
    }
  }

  // Total interest includes any (uncapitalized) grace interest that is still owed.
  const repaymentInterest = cumInterest;
  const totalInterest = capitalizeGraceInterest
    ? repaymentInterest + graceInterest
    : repaymentInterest;
  const totalPaid = monthlyPayment * n + (capitalizeGraceInterest ? 0 : graceInterest);

  return {
    monthlyPayment,
    startingBalance,
    graceInterest,
    totalInterest,
    totalPaid,
    payoffMonths: grace + n,
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
