// Pure logic for the Second Mortgage Calculator.
// A second mortgage (a home equity loan) is a lump sum borrowed against the
// equity in a home you already own, repaid on a fixed amortization schedule that
// sits behind the first mortgage. This module computes the monthly payment, the
// total interest over the life of the loan, and a per-year balance schedule for
// charting. It also checks the requested loan against a combined loan-to-value
// (CLTV) limit so borrowers can see whether they actually have room to borrow.

export interface SecondMortgageInput {
  homeValue: number;
  firstMortgageBalance: number;
  loanAmount: number; // requested second-mortgage principal
  annualRatePct: number;
  termYears: number;
  maxCltvPct: number; // lender's combined loan-to-value ceiling, e.g. 85
}

export interface SecondMortgageYearPoint {
  year: number;
  balance: number; // remaining second-mortgage principal at year end
  principalPaid: number; // cumulative principal repaid
  interestPaid: number; // cumulative interest paid
}

export interface SecondMortgageResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  availableEquity: number; // max second mortgage allowed under the CLTV cap
  newCltvPct: number; // CLTV if the requested loan is taken
  exceedsCltv: boolean; // true when the requested loan breaks the cap
  schedule: SecondMortgageYearPoint[];
}

export function computeSecondMortgage(input: SecondMortgageInput): SecondMortgageResult | null {
  const { homeValue, firstMortgageBalance, loanAmount, annualRatePct, termYears, maxCltvPct } =
    input;

  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (homeValue <= 0 || firstMortgageBalance < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (maxCltvPct <= 0) return null;

  const months = Math.round(termYears * 12);
  const monthlyRate = annualRatePct / 100 / 12;

  // Standard amortizing payment; handle the zero-rate edge case separately.
  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / months
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

  let balance = loanAmount;
  let cumPrincipal = 0;
  let cumInterest = 0;

  const schedule: SecondMortgageYearPoint[] = [
    { year: 0, balance: loanAmount, principalPaid: 0, interestPaid: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance -= principal;
    cumPrincipal += principal;
    cumInterest += interest;
    if (m % 12 === 0 || m === months) {
      schedule.push({
        year: m / 12,
        balance: Math.max(0, balance),
        principalPaid: cumPrincipal,
        interestPaid: cumInterest,
      });
    }
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - loanAmount;

  // Equity room: how much can be borrowed in second position without breaking
  // the combined loan-to-value cap.
  const maxCombinedDebt = homeValue * (maxCltvPct / 100);
  const availableEquity = Math.max(0, maxCombinedDebt - firstMortgageBalance);
  const newCltvPct = ((firstMortgageBalance + loanAmount) / homeValue) * 100;
  const exceedsCltv = loanAmount > availableEquity;

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    availableEquity,
    newCltvPct,
    exceedsCltv,
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
