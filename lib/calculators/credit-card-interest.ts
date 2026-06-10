// Pure logic for the Credit Card Interest Calculator.
// Models paying down a revolving credit card balance with either a fixed monthly
// payment or a percent-of-balance minimum payment. Uses daily interest accrual
// approximated monthly (APR divided by 12), simulating until the balance clears
// or a cap of 600 months. Exposes a per-month schedule for charting payoff.

export type PayMode = "fixed" | "minimum";

export interface CreditCardInput {
  balance: number; // current statement balance owed
  aprPct: number; // annual percentage rate
  payMode: PayMode;
  fixedPayment: number; // dollars per month (fixed mode)
  minPercent: number; // percent of balance per month (minimum mode)
  minFloor: number; // dollar floor for the minimum payment
}

export interface CreditCardMonthPoint {
  month: number;
  balance: number; // remaining after this month's payment
  interest: number; // interest charged this month
  principal: number; // principal paid this month
}

export interface CreditCardResult {
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number; // principal plus interest
  firstPayment: number; // the first month's payment amount
  firstInterest: number; // interest portion of the first month
  payoffYears: number;
  neverPaysOff: boolean; // payment cannot cover interest
  schedule: CreditCardMonthPoint[];
}

const MAX_MONTHS = 600;

export function computeCreditCard(input: CreditCardInput): CreditCardResult | null {
  const { balance, aprPct, payMode, fixedPayment, minPercent, minFloor } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(aprPct) || aprPct < 0) return null;
  if (payMode === "fixed" && (!Number.isFinite(fixedPayment) || fixedPayment <= 0)) return null;
  if (payMode === "minimum") {
    if (!Number.isFinite(minPercent) || minPercent <= 0) return null;
    if (!Number.isFinite(minFloor) || minFloor < 0) return null;
  }

  const monthlyRate = aprPct / 100 / 12;
  let bal = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;

  const schedule: CreditCardMonthPoint[] = [
    { month: 0, balance: bal, interest: 0, principal: 0 },
  ];

  let firstPayment = 0;
  let firstInterest = 0;

  // Detect a payment that can never overcome interest (fixed mode only).
  if (payMode === "fixed") {
    const firstMonthInterest = bal * monthlyRate;
    if (fixedPayment <= firstMonthInterest) {
      return {
        monthsToPayoff: Infinity,
        totalInterest: Infinity,
        totalPaid: Infinity,
        firstPayment: fixedPayment,
        firstInterest: firstMonthInterest,
        payoffYears: Infinity,
        neverPaysOff: true,
        schedule,
      };
    }
  }

  while (bal > 0.005 && months < MAX_MONTHS) {
    months++;
    const interest = bal * monthlyRate;

    let payment: number;
    if (payMode === "fixed") {
      payment = fixedPayment;
    } else {
      // Minimum is the greater of a percent of the (post-interest) balance and the floor.
      const balWithInterest = bal + interest;
      payment = Math.max(balWithInterest * (minPercent / 100), minFloor);
    }

    // Never pay more than what is owed this month.
    const owed = bal + interest;
    if (payment > owed) payment = owed;

    const principal = payment - interest;
    bal = owed - payment;
    totalInterest += interest;
    totalPaid += payment;

    if (months === 1) {
      firstPayment = payment;
      firstInterest = interest;
    }

    schedule.push({ month: months, balance: Math.max(0, bal), interest, principal });
  }

  const neverPaysOff = bal > 0.005; // hit cap without clearing

  return {
    monthsToPayoff: neverPaysOff ? Infinity : months,
    totalInterest,
    totalPaid,
    firstPayment,
    firstInterest,
    payoffYears: neverPaysOff ? Infinity : months / 12,
    neverPaysOff,
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
