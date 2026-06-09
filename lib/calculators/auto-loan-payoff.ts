// Pure logic for the Auto Loan Payoff Calculator. Given a current balance, rate and
// monthly payment, it amortizes month by month until the balance reaches zero to find
// the time to payoff and total interest. It also compares paying an optional extra
// amount each month against the base payment to show the interest and time saved.

export interface AutoLoanPayoffInput {
  currentBalance: number;
  annualRatePct: number;
  monthlyPayment: number;
  extraMonthly?: number; // optional additional payment toward principal each month
}

export interface AutoLoanPayoffYearPoint {
  year: number;
  balance: number; // remaining balance WITH the extra payment applied
  interestPaid: number; // cumulative interest paid by end of year (with extra)
}

export interface PayoffSummary {
  months: number;
  totalInterest: number;
  totalPaid: number; // principal + interest paid over the life of the loan
}

export interface AutoLoanPayoffResult {
  withExtra: PayoffSummary;
  withoutExtra: PayoffSummary;
  monthsSaved: number;
  interestSaved: number;
  hasExtra: boolean;
  schedule: AutoLoanPayoffYearPoint[];
}

// Amortize a balance at a fixed monthly rate with a fixed monthly payment until paid
// off. Returns null when the payment can never cover the first month of interest, so
// the balance would grow forever. Optionally records a yearly schedule.
function amortize(
  balance: number,
  r: number,
  payment: number,
  schedule?: AutoLoanPayoffYearPoint[],
): PayoffSummary | null {
  // With a positive rate, the payment must exceed the interest accruing on the
  // starting balance, otherwise the loan never reduces.
  if (r > 0 && payment <= balance * r) return null;

  let bal = balance;
  let cumInterest = 0;
  let cumPaid = 0;
  let m = 0;
  const MAX_MONTHS = 1200; // 100 years hard stop as a safety guard

  if (schedule) schedule.push({ year: 0, balance: bal, interestPaid: 0 });

  while (bal > 0 && m < MAX_MONTHS) {
    m++;
    const interest = bal * r;
    let principal = payment - interest;
    if (principal > bal) principal = bal; // final payment guard
    const paid = principal + interest;
    bal = Math.max(0, bal - principal);
    cumInterest += interest;
    cumPaid += paid;
    if (schedule && (m % 12 === 0 || bal <= 0)) {
      schedule.push({ year: m / 12, balance: bal, interestPaid: cumInterest });
    }
  }

  if (bal > 0) return null; // never paid off within the safety guard

  return { months: m, totalInterest: cumInterest, totalPaid: cumPaid };
}

export function computeAutoLoanPayoff(input: AutoLoanPayoffInput): AutoLoanPayoffResult | null {
  const { currentBalance, annualRatePct, monthlyPayment, extraMonthly = 0 } = input;

  if (!Number.isFinite(currentBalance) || currentBalance <= 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (annualRatePct < 0 || extraMonthly < 0) return null;
  if (!Number.isFinite(annualRatePct) || !Number.isFinite(extraMonthly)) return null;

  const r = annualRatePct / 100 / 12;

  const schedule: AutoLoanPayoffYearPoint[] = [];
  const withExtra = amortize(currentBalance, r, monthlyPayment + extraMonthly, schedule);
  // A payment too small to ever cover interest means the loan never pays off.
  if (!withExtra) return null;

  const withoutExtra = amortize(currentBalance, r, monthlyPayment);
  if (!withoutExtra) return null;

  const hasExtra = extraMonthly > 0;
  const monthsSaved = Math.max(0, withoutExtra.months - withExtra.months);
  const interestSaved = Math.max(0, withoutExtra.totalInterest - withExtra.totalInterest);

  return {
    withExtra,
    withoutExtra,
    monthsSaved,
    interestSaved,
    hasExtra,
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

// Format a whole number of months as a friendly "X yr Y mo" string.
export function formatMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 mo";
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} yr`);
  if (mos > 0) parts.push(`${mos} mo`);
  return parts.join(" ") || "0 mo";
}
