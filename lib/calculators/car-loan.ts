// Pure logic for the Car Loan Calculator. Computes the monthly payment using the
// standard amortizing loan (EMI) formula, the total interest and total cost, plus a
// yearly amortization schedule for charting the remaining balance over time.

export interface CarLoanInput {
  carPrice: number;
  downPayment: number; // dollar amount
  annualRatePct: number;
  termYears: number;
}

export interface CarLoanYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by end of year
  principalPaid: number; // cumulative principal paid by end of year
}

export interface CarLoanResult {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number; // loan principal + total interest (amount repaid to the lender)
  payoffYears: number;
  schedule: CarLoanYearPoint[];
}

export function computeCarLoan(input: CarLoanInput): CarLoanResult | null {
  const { carPrice, downPayment, annualRatePct, termYears } = input;

  if (!Number.isFinite(carPrice) || carPrice <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0 || downPayment < 0) return null;

  const loanAmount = Math.max(0, carPrice - downPayment);
  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  // EMI = P*r*(1+r)^n / ((1+r)^n - 1); if r == 0, EMI = P / n.
  const monthlyPayment =
    loanAmount === 0
      ? 0
      : r > 0
        ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : loanAmount / n;

  // Amortize month by month to build the yearly schedule and total interest.
  let balance = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const schedule: CarLoanYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance; // last payment guard
    balance = Math.max(0, balance - principal);
    cumInterest += interest;
    cumPrincipal += principal;
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
  const totalCost = loanAmount + totalInterest;

  return {
    loanAmount,
    monthlyPayment,
    totalInterest,
    totalCost,
    payoffYears: termYears,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
