// Pure logic for the Debt Payoff Calculator.
// Works out how long it takes to clear a single balance at a fixed monthly
// payment and APR, how much interest that costs, and the total paid. Simulates
// the loan month by month for accuracy and to build a remaining-balance
// schedule for an optional chart. Returns null when the payment is too small
// to cover the monthly interest, because then the balance never reaches zero.

export interface DebtPayoffInput {
  balance: number; // current debt balance
  aprPct: number; // annual percentage rate, e.g. 19.99
  payment: number; // fixed amount paid each month
}

export interface DebtPayoffMonthPoint {
  month: number; // 0 = starting balance, 1 = after first payment, ...
  balance: number; // remaining balance at the end of this month
}

export interface DebtPayoffResult {
  months: number; // whole months until the balance is cleared
  years: number; // whole years portion of months
  monthsRemainder: number; // leftover months after the whole years
  totalInterest: number; // sum of interest charged over the life of the debt
  totalPaid: number; // balance + total interest
  monthlyRate: number; // periodic rate used (apr/100/12)
  schedule: DebtPayoffMonthPoint[]; // remaining balance per month for charting
}

export function computeDebtPayoff(input: DebtPayoffInput): DebtPayoffResult | null {
  const { balance, aprPct, payment } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(aprPct) || aprPct < 0) return null;
  if (!Number.isFinite(payment) || payment <= 0) return null;

  const r = aprPct / 100 / 12;

  // Closed-form month count, used to size the projection and to validate the
  // payment up front. When r is 0 there is no interest, so it is simple division.
  let months: number;
  if (r === 0) {
    months = Math.ceil(balance / payment);
  } else {
    // Payment must at least cover the first month's interest, otherwise the
    // balance grows without bound and the log argument goes non-positive.
    if (payment <= balance * r) return null;
    months = Math.ceil(-Math.log(1 - (r * balance) / payment) / Math.log(1 + r));
  }

  if (!Number.isFinite(months) || months <= 0) return null;

  // Simulate month by month so the totals match what a real lender would charge,
  // clamping the final payment so we never overpay past a zero balance.
  const schedule: DebtPayoffMonthPoint[] = [{ month: 0, balance }];
  let remaining = balance;
  let totalInterest = 0;
  let totalPaid = 0;

  for (let m = 1; m <= months; m++) {
    const interest = remaining * r;
    let pay = payment;
    if (pay > remaining + interest) {
      // Final, smaller payment that exactly clears the balance plus its interest.
      pay = remaining + interest;
    }
    totalInterest += interest;
    totalPaid += pay;
    remaining = remaining + interest - pay;
    if (remaining < 0) remaining = 0;
    schedule.push({ month: m, balance: remaining });
    if (remaining <= 0) {
      months = m;
      break;
    }
  }

  const years = Math.floor(months / 12);
  const monthsRemainder = months % 12;

  return {
    months,
    years,
    monthsRemainder,
    totalInterest,
    totalPaid,
    monthlyRate: r,
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

export function formatDuration(years: number, monthsRemainder: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (monthsRemainder > 0)
    parts.push(`${monthsRemainder} ${monthsRemainder === 1 ? "month" : "months"}`);
  if (parts.length === 0) return "0 months";
  return parts.join(" ");
}
