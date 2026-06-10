// Pure logic for the Mortgage Overpayment Calculator.
// Simulates a fixed-rate mortgage twice: once paying only the scheduled monthly
// amount, and once adding a regular monthly overpayment. Reports how much time
// and interest the overpayment saves, plus year-by-year balance curves for both
// scenarios so they can be charted together.

export interface MortgageOverpaymentInput {
  balance: number; // current outstanding balance
  annualRatePct: number;
  remainingYears: number;
  monthlyOverpayment: number;
}

export interface OverpayYearPoint {
  year: number;
  baseBalance: number; // balance with no overpayment
  overBalance: number; // balance with overpayment
}

export interface MortgageOverpaymentResult {
  basePayment: number; // scheduled monthly payment
  baseTotalInterest: number;
  overTotalInterest: number;
  interestSaved: number;
  baseMonths: number;
  overMonths: number;
  monthsSaved: number;
  schedule: OverpayYearPoint[];
}

function payoff(balance: number, monthlyRate: number, payment: number): { months: number; interest: number; yearly: number[] } {
  let bal = balance;
  let interest = 0;
  const yearly: number[] = [balance];
  let m = 0;
  const cap = 1200; // 100 years guard
  while (bal > 0.005 && m < cap) {
    m++;
    const i = bal * monthlyRate;
    let principal = payment - i;
    if (principal <= 0) break; // payment can never cover interest -> never pays off
    if (principal > bal) principal = bal;
    bal -= principal;
    interest += i;
    if (m % 12 === 0 || bal <= 0.005) yearly.push(Math.max(bal, 0));
  }
  return { months: m, interest, yearly };
}

export function computeMortgageOverpayment(
  input: MortgageOverpaymentInput,
): MortgageOverpaymentResult | null {
  const { balance, annualRatePct, remainingYears, monthlyOverpayment } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(remainingYears) || remainingYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (monthlyOverpayment < 0) return null;

  const months = Math.round(remainingYears * 12);
  const r = annualRatePct / 100 / 12;
  const basePayment =
    r === 0 ? balance / months : (balance * r) / (1 - Math.pow(1 + r, -months));

  const base = payoff(balance, r, basePayment);
  const over = payoff(balance, r, basePayment + monthlyOverpayment);

  const years = Math.max(base.yearly.length, over.yearly.length);
  const schedule: OverpayYearPoint[] = [];
  for (let y = 0; y < years; y++) {
    const baseBalance = y < base.yearly.length ? base.yearly[y] : 0;
    const overBalance = y < over.yearly.length ? over.yearly[y] : 0;
    schedule.push({ year: y, baseBalance, overBalance });
  }

  return {
    basePayment,
    baseTotalInterest: base.interest,
    overTotalInterest: over.interest,
    interestSaved: base.interest - over.interest,
    baseMonths: base.months,
    overMonths: over.months,
    monthsSaved: base.months - over.months,
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
