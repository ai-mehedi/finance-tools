// Pure logic for the Loan EMI Calculator. Computes the monthly EMI, total
// interest and total payment for a loan, plus a yearly amortization schedule
// for charting the remaining balance over time.
//
// EMI = P * r * (1+r)^n / ((1+r)^n - 1)
//   P = loan principal, r = monthly rate (annualRatePct/100/12), n = months.
// If r == 0, EMI = P / n.

export interface LoanEmiInput {
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
}

export interface LoanEmiYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by end of year
  principalPaid: number; // cumulative principal paid by end of year
}

export interface LoanEmiResult {
  loanAmount: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number; // principal + interest over the loan
  payoffYears: number;
  schedule: LoanEmiYearPoint[];
}

export function computeLoanEmi(input: LoanEmiInput): LoanEmiResult | null {
  const { loanAmount, annualRatePct, termYears } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyEMI =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;

  // Amortize month by month to build the yearly schedule and total interest.
  let balance = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const schedule: LoanEmiYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = monthlyEMI - interest;
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
  const totalPayment = loanAmount + totalInterest;

  return {
    loanAmount,
    monthlyEMI,
    totalInterest,
    totalPayment,
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
