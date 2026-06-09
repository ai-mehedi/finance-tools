// Pure logic for the Mortgage Calculator. Computes monthly principal & interest,
// optional tax/insurance/HOA for a full PITI payment, and a yearly amortization
// schedule for charting the remaining balance.

export interface MortgageInput {
  homePrice: number;
  downPayment: number; // dollar amount
  annualRatePct: number;
  termYears: number;
  annualTax?: number; // property tax / year
  annualInsurance?: number; // home insurance / year
  monthlyHOA?: number;
}

export interface MortgageYearPoint {
  year: number;
  balance: number;
  interestPaid: number; // cumulative interest paid by end of year
  principalPaid: number; // cumulative principal paid by end of year
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  totalMonthly: number;
  totalInterest: number;
  totalPaid: number; // principal + interest over the loan
  payoffYears: number;
  schedule: MortgageYearPoint[];
}

export function computeMortgage(input: MortgageInput): MortgageResult | null {
  const {
    homePrice,
    downPayment,
    annualRatePct,
    termYears,
    annualTax = 0,
    annualInsurance = 0,
    monthlyHOA = 0,
  } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0 || downPayment < 0) return null;

  const loanAmount = Math.max(0, homePrice - downPayment);
  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyPI =
    loanAmount === 0
      ? 0
      : r > 0
        ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : loanAmount / n;

  // Amortize month by month to build the yearly schedule and total interest.
  let balance = loanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;
  const schedule: MortgageYearPoint[] = [
    { year: 0, balance: loanAmount, interestPaid: 0, principalPaid: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    let principal = monthlyPI - interest;
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

  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA;
  const totalInterest = cumInterest;
  const totalPaid = loanAmount + totalInterest;

  return {
    loanAmount,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    totalMonthly,
    totalInterest,
    totalPaid,
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
