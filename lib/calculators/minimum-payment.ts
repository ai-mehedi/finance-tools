// Pure logic for the Minimum Payment Calculator.
// Simulates paying a credit card by its minimum payment each month, where the
// minimum is the greater of a percentage of the balance or a fixed floor.
// Returns the payoff time, total interest, and a per-month schedule for charting.

export interface MinimumPaymentInput {
  balance: number;
  annualAprPct: number;
  minPercent: number; // minimum as a percent of the current balance, e.g. 2
  minFloor: number; // absolute minimum dollars, e.g. 25
  maxYears: number; // safety cap so the loop always ends
}

export interface MinPayMonthPoint {
  month: number;
  balance: number;
  payment: number;
  interest: number;
}

export interface MinimumPaymentResult {
  monthsToPayoff: number;
  yearsToPayoff: number;
  firstPayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffPossible: boolean; // false when the minimum cannot cover monthly interest
  schedule: MinPayMonthPoint[];
}

export function computeMinimumPayment(input: MinimumPaymentInput): MinimumPaymentResult | null {
  const { balance, annualAprPct, minPercent, minFloor, maxYears } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(annualAprPct) || annualAprPct < 0) return null;
  if (!Number.isFinite(minPercent) || minPercent <= 0) return null;
  if (!Number.isFinite(minFloor) || minFloor < 0) return null;
  if (!Number.isFinite(maxYears) || maxYears <= 0) return null;

  const monthlyRate = annualAprPct / 100 / 12;
  const maxMonths = Math.round(maxYears * 12);

  let bal = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let firstPayment = 0;
  let months = 0;
  let payoffPossible = true;

  const schedule: MinPayMonthPoint[] = [
    { month: 0, balance: bal, payment: 0, interest: 0 },
  ];

  for (let m = 1; m <= maxMonths; m++) {
    const interest = bal * monthlyRate;
    let payment = Math.max(bal * (minPercent / 100), minFloor);

    // The minimum can never exceed what is owed this month (balance plus interest).
    if (payment > bal + interest) payment = bal + interest;

    // If even the largest available minimum cannot beat the monthly interest, the
    // balance can never fall — flag it and stop simulating.
    if (payment <= interest) {
      payoffPossible = false;
      if (m === 1) firstPayment = payment;
      break;
    }

    bal = bal + interest - payment;
    if (bal < 0.005) bal = 0;

    totalInterest += interest;
    totalPaid += payment;
    if (m === 1) firstPayment = payment;
    months = m;

    schedule.push({ month: m, balance: bal, payment, interest });

    if (bal <= 0) break;
  }

  // Hit the safety cap while still owing money.
  if (bal > 0 && months >= maxMonths) payoffPossible = false;

  return {
    monthsToPayoff: months,
    yearsToPayoff: months / 12,
    firstPayment,
    totalInterest,
    totalPaid,
    payoffPossible: payoffPossible && bal <= 0,
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

export function formatDuration(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 mo";
  const yrs = Math.floor(months / 12);
  const mo = Math.round(months % 12);
  if (yrs === 0) return `${mo} mo`;
  if (mo === 0) return `${yrs} yr`;
  return `${yrs} yr ${mo} mo`;
}
