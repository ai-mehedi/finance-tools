// Pure logic for the Amortization Schedule Calculator.
// Computes the level monthly payment for a loan and amortizes it month by month
// to build a full schedule, a per-year summary for charting the falling
// balance, and lifetime interest.

export interface AmortizationInput {
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
}

export interface AmortizationRow {
  period: number; // payment number, 1-based
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AmortizationYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest by end of year
  principalPaid: number; // cumulative principal by end of year
}

export interface AmortizationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  numberOfPayments: number;
  rows: AmortizationRow[]; // every monthly payment
  schedule: AmortizationYearPoint[]; // one point per year, starting at year 0
}

export function computeAmortization(input: AmortizationInput): AmortizationResult | null {
  const { loanAmount, annualRatePct, termYears } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyPayment =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;

  let balance = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const rows: AmortizationRow[] = [];
  const schedule: AmortizationYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance; // last payment guard
    balance = Math.max(0, balance - principal);
    cumInterest += interest;
    cumPrincipal += principal;
    rows.push({ period: m, payment: principal + interest, principal, interest, balance });
    if (m % 12 === 0 || m === n) {
      schedule.push({
        year: m / 12,
        balance,
        interestPaid: cumInterest,
        principalPaid: cumPrincipal,
      });
    }
  }

  const totalInterest = cumInterest;
  const totalPaid = loanAmount + totalInterest;

  return {
    monthlyPayment,
    totalInterest,
    totalPaid,
    numberOfPayments: n,
    rows,
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

export const formatUSD = (n: number): string => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number): string => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
