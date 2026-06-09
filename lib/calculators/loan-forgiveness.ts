// Pure logic for the Student Loan Forgiveness Calculator.
// Models a standard fixed-payment plan where you make a set number of qualifying
// monthly payments (for example 120 payments under Public Service Loan
// Forgiveness) and any remaining balance is forgiven. It amortizes month by
// month and exposes a per-year balance schedule for charting.

export interface LoanForgivenessInput {
  balance: number;
  annualRatePct: number;
  monthlyPayment: number;
  forgivenessMonths: number; // qualifying payments required before forgiveness
}

export interface ForgivenessYearPoint {
  year: number;
  balance: number;
  paid: number; // cumulative amount paid by end of year
}

export interface LoanForgivenessResult {
  monthsToForgiveness: number;
  totalPaid: number; // total paid up to forgiveness or full payoff
  amountForgiven: number; // balance written off at the forgiveness point
  paysOffEarly: boolean; // true if the loan clears before forgiveness
  monthsToPayoff: number; // months to fully clear if it does pay off
  schedule: ForgivenessYearPoint[];
}

export function computeLoanForgiveness(
  input: LoanForgivenessInput,
): LoanForgivenessResult | null {
  const { balance, annualRatePct, monthlyPayment, forgivenessMonths } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (!Number.isFinite(forgivenessMonths) || forgivenessMonths <= 0) return null;
  if (annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const cap = Math.round(forgivenessMonths);

  let bal = balance;
  let paid = 0;
  let paysOffEarly = false;
  let monthsToPayoff = cap;

  const schedule: ForgivenessYearPoint[] = [{ year: 0, balance, paid: 0 }];

  let m = 0;
  for (m = 1; m <= cap; m++) {
    const interest = bal * r;
    let principal = monthlyPayment - interest;

    if (principal <= 0 && r > 0) {
      // Payment does not even cover interest, balance never falls.
      bal = bal + interest - monthlyPayment;
      if (bal < 0) bal = 0;
      paid += monthlyPayment;
    } else {
      if (principal > bal) principal = bal;
      const thisPayment = principal + interest;
      bal = Math.max(0, bal - principal);
      paid += thisPayment;
    }

    if (m % 12 === 0 || m === cap || bal === 0) {
      schedule.push({ year: m / 12, balance: bal, paid });
    }

    if (bal === 0) {
      paysOffEarly = true;
      monthsToPayoff = m;
      break;
    }
  }

  const amountForgiven = paysOffEarly ? 0 : bal;

  return {
    monthsToForgiveness: cap,
    totalPaid: paid,
    amountForgiven,
    paysOffEarly,
    monthsToPayoff,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
