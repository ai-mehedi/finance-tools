// Pure logic for the Mortgage Calculator. Computes monthly principal & interest,
// optional tax/insurance/HOA for a full PITI payment, the effect of an optional
// extra monthly principal payment, a full month-by-month amortization schedule,
// and a yearly schedule for charting the remaining balance.

export interface MortgageInput {
  homePrice: number;
  downPayment: number; // dollar amount
  annualRatePct: number;
  termYears: number;
  annualTax?: number; // property tax / year
  annualInsurance?: number; // home insurance / year
  monthlyHOA?: number;
  extraMonthly?: number; // extra principal paid each month
}

export interface MortgageYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by end of year
  principalPaid: number; // cumulative principal paid by end of year
}

/** One row of the amortization schedule (shared shape with other loan tools). */
export interface AmortRow {
  month: number; // 1-based payment number
  payment: number; // principal + interest paid this month (excludes escrow)
  principal: number;
  interest: number;
  balance: number; // remaining after this payment
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  totalMonthly: number; // PITI + extra
  totalInterest: number;
  totalPaid: number; // principal + interest over the loan
  payoffYears: number; // actual payoff time (shortened by extra payments)
  payoffMonths: number; // actual payoff time in months
  extraMonthly: number;
  /** Interest saved vs paying no extra (0 when no extra payment). */
  interestSaved: number;
  /** Months shaved off the term by the extra payment (0 when none). */
  monthsSaved: number;
  schedule: MortgageYearPoint[]; // yearly, for charting
  amortization: AmortRow[]; // full monthly schedule, for the table + CSV
}

/** Amortize a loan month by month, optionally with extra principal. Returns the
 *  full schedule plus totals. Kept separate so we can run it twice (with and
 *  without extra) to measure the savings. */
function amortize(loanAmount: number, monthlyRate: number, basePayment: number, extra: number) {
  const rows: AmortRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  // Hard cap iterations so a payment that never covers interest can't loop forever.
  const maxMonths = 12 * 100;

  for (let m = 1; balance > 0.005 && m <= maxMonths; m++) {
    const interest = balance * monthlyRate;
    let principal = basePayment + extra - interest;
    if (principal <= 0) break; // payment doesn't cover interest — would never amortize
    if (principal > balance) principal = balance; // final payment guard
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    rows.push({ month: m, payment: principal + interest, principal, interest, balance });
  }

  return { rows, totalInterest, payoffMonths: rows.length };
}

export function computeMortgage(input: MortgageInput): MortgageResult | null {
  const {
    homePrice,
    downPayment,
    annualRatePct,
    termYears,
    annualTax = 0,
    annualInsurance = 0,
    monthlyHOA = 0,
    extraMonthly = 0,
  } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0 || downPayment < 0 || extraMonthly < 0) return null;

  const loanAmount = Math.max(0, homePrice - downPayment);
  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyPI =
    loanAmount === 0
      ? 0
      : r > 0
        ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : loanAmount / n;

  // Actual schedule (with any extra payment) and the no-extra baseline for savings.
  const actual = amortize(loanAmount, r, monthlyPI, extraMonthly);
  const baseline = extraMonthly > 0 ? amortize(loanAmount, r, monthlyPI, 0) : actual;

  // Yearly schedule for the balance chart, derived from the monthly amortization.
  const schedule: MortgageYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];
  let cumInterest = 0;
  let cumPrincipal = 0;
  for (const row of actual.rows) {
    cumInterest += row.interest;
    cumPrincipal += row.principal;
    if (row.month % 12 === 0 || row.month === actual.payoffMonths) {
      schedule.push({
        year: Math.ceil(row.month / 12),
        balance: row.balance,
        interestPaid: cumInterest,
        principalPaid: cumPrincipal,
      });
    }
  }

  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthly = monthlyPI + extraMonthly + monthlyTax + monthlyInsurance + monthlyHOA;
  const totalInterest = actual.totalInterest;

  return {
    loanAmount,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    totalMonthly,
    totalInterest,
    totalPaid: loanAmount + totalInterest,
    payoffYears: actual.payoffMonths / 12,
    payoffMonths: actual.payoffMonths,
    extraMonthly,
    interestSaved: Math.max(0, baseline.totalInterest - actual.totalInterest),
    monthsSaved: Math.max(0, baseline.payoffMonths - actual.payoffMonths),
    schedule,
    amortization: actual.rows,
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
