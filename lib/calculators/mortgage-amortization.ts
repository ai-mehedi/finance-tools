// Pure logic for the Mortgage Amortization Calculator.
// Builds a full payment-by-payment amortization schedule for a fixed-rate
// loan, optionally with a recurring extra monthly principal payment, and
// exposes a per-year roll-up for charting the falling balance versus the
// shrinking interest each year.

export interface AmortizationInput {
  loanAmount: number; // principal borrowed
  annualRatePct: number; // nominal annual interest rate
  termYears: number; // loan length in years
  extraMonthly: number; // optional extra principal paid every month
}

export interface AmortizationYearPoint {
  year: number;
  balance: number; // remaining principal at end of year
  principalPaid: number; // principal repaid during the year
  interestPaid: number; // interest paid during the year
  cumulativeInterest: number;
}

export interface AmortizationResult {
  monthlyPayment: number; // scheduled principal & interest (no extra)
  totalPayment: number; // every dollar paid, principal + interest
  totalInterest: number; // interest over the life of the loan
  payoffMonths: number; // months until balance reaches zero
  interestSaved: number; // vs. the same loan with no extra payment
  monthsSaved: number; // vs. the same loan with no extra payment
  schedule: AmortizationYearPoint[];
}

function payment(loan: number, monthlyRate: number, months: number): number {
  if (months <= 0) return loan;
  if (monthlyRate === 0) return loan / months;
  return (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

// Run the loan to payoff and return total interest + months taken.
function simulate(loan: number, monthlyRate: number, basePayment: number, extra: number) {
  let balance = loan;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 12 * 1000; // safety cap
  while (balance > 0.005 && months < maxMonths) {
    const interest = balance * monthlyRate;
    let principal = basePayment - interest + extra;
    if (principal <= 0) return { totalInterest: Infinity, months: Infinity }; // never amortizes
    if (principal > balance) principal = balance;
    balance -= principal;
    totalInterest += interest;
    months++;
  }
  return { totalInterest, months };
}

export function computeAmortization(input: AmortizationInput): AmortizationResult | null {
  const { loanAmount, annualRatePct, termYears, extraMonthly } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (extraMonthly < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const scheduledMonths = Math.round(termYears * 12);
  const monthlyPayment = payment(loanAmount, monthlyRate, scheduledMonths);

  // Baseline (no extra) for comparison.
  const base = simulate(loanAmount, monthlyRate, monthlyPayment, 0);

  // Actual run with the extra payment, capturing a per-year schedule.
  let balance = loanAmount;
  let cumulativeInterest = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 12 * 1000;

  const schedule: AmortizationYearPoint[] = [
    { year: 0, balance: loanAmount, principalPaid: 0, interestPaid: 0, cumulativeInterest: 0 },
  ];

  while (balance > 0.005 && months < maxMonths) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest + extraMonthly;
    if (principal <= 0) break;
    if (principal > balance) principal = balance;
    balance -= principal;
    totalInterest += interest;
    cumulativeInterest += interest;
    yearPrincipal += principal;
    yearInterest += interest;
    months++;

    if (months % 12 === 0 || balance <= 0.005) {
      schedule.push({
        year: months / 12,
        balance: Math.max(0, balance),
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        cumulativeInterest,
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const totalPayment = loanAmount + totalInterest;
  const interestSaved = Number.isFinite(base.totalInterest) ? Math.max(0, base.totalInterest - totalInterest) : 0;
  const monthsSaved = Number.isFinite(base.months) ? Math.max(0, base.months - months) : 0;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    payoffMonths: months,
    interestSaved,
    monthsSaved,
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
