// Pure logic for the Loan Payoff Calculator.
// Amortizes a loan with its scheduled monthly payment plus an optional extra
// monthly payment, and reports how soon the loan is cleared and how much
// interest is saved versus paying only the scheduled amount. Exposes a
// per-month balance schedule for charting.

export interface LoanPayoffInput {
  balance: number;
  annualRatePct: number;
  monthlyPayment: number; // scheduled minimum payment
  extraPayment: number; // additional amount applied each month
}

export interface LoanPayoffMonthPoint {
  month: number;
  balance: number; // remaining balance with extra payments
  baselineBalance: number; // remaining balance with scheduled payment only
}

export interface LoanPayoffResult {
  monthsToPayoff: number;
  baselineMonths: number;
  monthsSaved: number;
  totalInterest: number;
  baselineInterest: number;
  interestSaved: number;
  totalPaid: number;
  monthlyOutlay: number; // scheduled + extra
  schedule: LoanPayoffMonthPoint[];
}

const MAX_MONTHS = 1200; // 100-year safety cap

// Runs an amortization with a fixed monthly payment and returns months taken
// plus total interest. Returns null if the payment never covers interest.
function amortize(balance: number, monthlyRate: number, payment: number): { months: number; interest: number } | null {
  let bal = balance;
  let interest = 0;
  let months = 0;
  while (bal > 0.005 && months < MAX_MONTHS) {
    const monthInterest = bal * monthlyRate;
    let principal = payment - monthInterest;
    if (principal <= 0) return null; // payment too small to ever clear the loan
    if (principal > bal) principal = bal;
    bal -= principal;
    interest += monthInterest;
    months++;
  }
  return { months, interest };
}

export function computeLoanPayoff(input: LoanPayoffInput): LoanPayoffResult | null {
  const { balance, annualRatePct, monthlyPayment, extraPayment } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (!Number.isFinite(extraPayment) || extraPayment < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const payment = monthlyPayment + extraPayment;

  // Baseline: scheduled payment only.
  const baseline = amortize(balance, monthlyRate, monthlyPayment);
  if (!baseline) return null; // scheduled payment cannot clear the loan

  // With-extra: scheduled plus extra payment.
  const withExtra = amortize(balance, monthlyRate, payment);
  if (!withExtra) return null;

  // Build a month-by-month schedule for both scenarios for charting.
  const schedule: LoanPayoffMonthPoint[] = [
    { month: 0, balance, baselineBalance: balance },
  ];
  let bal = balance;
  let baseBal = balance;
  const totalMonths = Math.max(withExtra.months, baseline.months);
  for (let m = 1; m <= totalMonths; m++) {
    if (bal > 0.005) {
      const i = bal * monthlyRate;
      let p = payment - i;
      if (p > bal) p = bal;
      bal = Math.max(0, bal - p);
    }
    if (baseBal > 0.005) {
      const i = baseBal * monthlyRate;
      let p = monthlyPayment - i;
      if (p > baseBal) p = baseBal;
      baseBal = Math.max(0, baseBal - p);
    }
    schedule.push({ month: m, balance: bal, baselineBalance: baseBal });
  }

  return {
    monthsToPayoff: withExtra.months,
    baselineMonths: baseline.months,
    monthsSaved: baseline.months - withExtra.months,
    totalInterest: withExtra.interest,
    baselineInterest: baseline.interest,
    interestSaved: baseline.interest - withExtra.interest,
    totalPaid: balance + withExtra.interest,
    monthlyOutlay: payment,
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

// Formats a month count as "Xy Ym".
export function formatDuration(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0m";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}m`;
  if (m === 0) return `${y}y`;
  return `${y}y ${m}m`;
}
