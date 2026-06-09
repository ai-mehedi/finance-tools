// Pure logic for the Extra Payment Savings Calculator.
// Amortizes a loan twice, once at the scheduled payment and once with a fixed
// extra amount applied to principal every month, then reports the interest
// saved and the time shaved off. A per-year balance schedule for both cases is
// produced for charting how much faster the balance falls.

export interface ExtraPaymentInput {
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
  extraMonthly: number; // additional principal paid each month
}

export interface ExtraPaymentYearPoint {
  year: number;
  baseBalance: number; // remaining balance with no extra payment
  extraBalance: number; // remaining balance with the extra payment
}

export interface ExtraPaymentResult {
  monthlyPayment: number; // scheduled principal and interest
  baseTotalInterest: number;
  extraTotalInterest: number;
  interestSaved: number;
  baseMonths: number; // payoff time without extra
  extraMonths: number; // payoff time with extra
  monthsSaved: number;
  schedule: ExtraPaymentYearPoint[];
}

interface AmortOutcome {
  months: number;
  totalInterest: number;
  yearEndBalances: number[]; // balance at the end of each whole year, index 0 = year 1
}

function amortize(balance: number, monthlyRate: number, payment: number, extra: number): AmortOutcome {
  let bal = balance;
  let totalInterest = 0;
  let month = 0;
  const yearEndBalances: number[] = [];
  // Cap iterations so a payment that never reduces principal cannot loop forever.
  const maxMonths = 12 * 1000;

  while (bal > 0 && month < maxMonths) {
    month++;
    const interest = bal * monthlyRate;
    let principal = payment - interest + extra;
    if (principal <= 0) {
      // Payment does not cover interest; treat as never paid off.
      month = maxMonths;
      break;
    }
    if (principal > bal) principal = bal;
    bal = bal - principal;
    totalInterest += interest;
    if (month % 12 === 0) yearEndBalances.push(bal);
  }
  if (month % 12 !== 0) yearEndBalances.push(bal);

  return { months: month, totalInterest, yearEndBalances };
}

export function computeExtraPayment(input: ExtraPaymentInput): ExtraPaymentResult | null {
  const { loanAmount, annualRatePct, termYears, extraMonthly } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0 || extraMonthly < 0) return null;

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyPayment =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;

  const base = amortize(loanAmount, r, monthlyPayment, 0);
  const extra = amortize(loanAmount, r, monthlyPayment, extraMonthly);

  const totalYears = Math.ceil(base.months / 12);
  const schedule: ExtraPaymentYearPoint[] = [
    { year: 0, baseBalance: loanAmount, extraBalance: loanAmount },
  ];
  for (let y = 1; y <= totalYears; y++) {
    const baseBalance = y <= base.yearEndBalances.length ? base.yearEndBalances[y - 1] : 0;
    const extraBalance = y <= extra.yearEndBalances.length ? extra.yearEndBalances[y - 1] : 0;
    schedule.push({ year: y, baseBalance: Math.max(0, baseBalance), extraBalance: Math.max(0, extraBalance) });
  }

  return {
    monthlyPayment,
    baseTotalInterest: base.totalInterest,
    extraTotalInterest: extra.totalInterest,
    interestSaved: base.totalInterest - extra.totalInterest,
    baseMonths: base.months,
    extraMonths: extra.months,
    monthsSaved: base.months - extra.months,
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

export function formatMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (rem > 0) parts.push(`${rem} ${rem === 1 ? "month" : "months"}`);
  return parts.length > 0 ? parts.join(" ") : "0 months";
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
