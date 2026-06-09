// Pure logic for the Credit Card Payoff Calculator.
// Given a balance, APR and either a fixed monthly payment, simulates the
// month-by-month paydown to find how long it takes and how much interest you
// pay. Exposes a monthly schedule for charting the falling balance.

export interface CreditCardPayoffInput {
  balance: number;
  annualRatePct: number; // APR
  monthlyPayment: number; // fixed amount paid each month
}

export interface PayoffMonthPoint {
  month: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by this month
}

export interface CreditCardPayoffResult {
  months: number; // months to pay off
  totalInterest: number;
  totalPaid: number; // principal + interest
  minimumWarning: boolean; // payment too small to ever clear the balance
  monthlyInterestFirst: number; // interest in the first month
  schedule: PayoffMonthPoint[];
}

const MAX_MONTHS = 1200; // 100 years guard

export function computeCreditCardPayoff(
  input: CreditCardPayoffInput
): CreditCardPayoffResult | null {
  const { balance, annualRatePct, monthlyPayment } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const firstInterest = balance * r;

  // If the payment cannot cover the first month of interest, the balance never
  // falls. Flag it instead of looping forever.
  if (monthlyPayment <= firstInterest && r > 0) {
    return {
      months: Infinity,
      totalInterest: Infinity,
      totalPaid: Infinity,
      minimumWarning: true,
      monthlyInterestFirst: firstInterest,
      schedule: [{ month: 0, balance, interestPaid: 0 }],
    };
  }

  let bal = balance;
  let cumInterest = 0;
  let month = 0;
  const schedule: PayoffMonthPoint[] = [{ month: 0, balance: bal, interestPaid: 0 }];

  while (bal > 0 && month < MAX_MONTHS) {
    month++;
    const interest = bal * r;
    cumInterest += interest;
    let pay = monthlyPayment;
    const owed = bal + interest;
    if (pay > owed) pay = owed; // final partial payment
    bal = owed - pay;
    if (bal < 0.005) bal = 0;
    schedule.push({ month, balance: bal, interestPaid: cumInterest });
  }

  return {
    months: month,
    totalInterest: cumInterest,
    totalPaid: balance + cumInterest,
    minimumWarning: false,
    monthlyInterestFirst: firstInterest,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatMonths(months: number): string {
  if (!Number.isFinite(months)) return "Never";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
