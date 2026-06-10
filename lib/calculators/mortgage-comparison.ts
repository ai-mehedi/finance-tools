// Pure logic for the Mortgage Comparison Calculator.
// Compares two fixed-rate mortgage offers on the same loan amount side by side:
// their monthly principal & interest, total interest over the term, upfront
// costs (points plus closing fees), and a true total cost that adds those
// upfront dollars to the interest. Also finds the break-even month where the
// cheaper-payment option recovers any higher upfront cost.

export interface OfferInput {
  annualRatePct: number; // interest rate for this offer
  termYears: number; // term in years for this offer
  pointsPct: number; // discount points, as % of loan amount
  feesFlat: number; // other closing fees, flat dollars
}

export interface OfferResult {
  monthlyPayment: number;
  totalInterest: number;
  upfrontCost: number; // points + fees
  totalCost: number; // total interest + upfront cost
  numPayments: number;
}

export interface ComparisonInput {
  loanAmount: number;
  a: OfferInput;
  b: OfferInput;
}

export interface ComparisonResult {
  loanAmount: number;
  a: OfferResult;
  b: OfferResult;
  cheaperByTotalCost: "A" | "B" | "tie";
  totalCostGap: number; // absolute difference in total cost
  monthlyGap: number; // absolute difference in monthly payment
  breakEvenMonth: number | null; // month the higher-upfront, lower-payment option pays off; null if none
  cheaperMonthly: "A" | "B" | "tie";
  bars: { label: string; interest: number; upfront: number }[];
}

function monthlyPayment(loan: number, annualRatePct: number, months: number): number {
  if (months <= 0) return loan;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return loan / months;
  return (loan * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
}

function evalOffer(loan: number, o: OfferInput): OfferResult {
  const months = Math.round(o.termYears * 12);
  const pay = monthlyPayment(loan, o.annualRatePct, months);
  const totalInterest = pay * months - loan;
  const upfrontCost = loan * (o.pointsPct / 100) + o.feesFlat;
  return {
    monthlyPayment: pay,
    totalInterest,
    upfrontCost,
    totalCost: totalInterest + upfrontCost,
    numPayments: months,
  };
}

export function computeComparison(input: ComparisonInput): ComparisonResult | null {
  const { loanAmount, a, b } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  for (const o of [a, b]) {
    if (!Number.isFinite(o.termYears) || o.termYears <= 0) return null;
    if (!Number.isFinite(o.annualRatePct) || o.annualRatePct < 0) return null;
    if (o.pointsPct < 0 || o.feesFlat < 0) return null;
  }

  const ra = evalOffer(loanAmount, a);
  const rb = evalOffer(loanAmount, b);

  const totalCostGap = Math.abs(ra.totalCost - rb.totalCost);
  const cheaperByTotalCost: "A" | "B" | "tie" =
    Math.abs(ra.totalCost - rb.totalCost) < 1 ? "tie" : ra.totalCost < rb.totalCost ? "A" : "B";

  const monthlyGap = Math.abs(ra.monthlyPayment - rb.monthlyPayment);
  const cheaperMonthly: "A" | "B" | "tie" =
    Math.abs(ra.monthlyPayment - rb.monthlyPayment) < 0.01 ? "tie" : ra.monthlyPayment < rb.monthlyPayment ? "A" : "B";

  // Break-even: the offer with the lower monthly payment usually costs more
  // upfront. Find how many months of payment savings it takes to recover the
  // extra upfront dollars.
  let breakEvenMonth: number | null = null;
  if (cheaperMonthly !== "tie") {
    const lower = cheaperMonthly === "A" ? ra : rb;
    const higher = cheaperMonthly === "A" ? rb : ra;
    const monthlySaving = higher.monthlyPayment - lower.monthlyPayment; // > 0
    const extraUpfront = lower.upfrontCost - higher.upfrontCost; // could be negative
    if (extraUpfront <= 0) {
      breakEvenMonth = 0; // lower payment AND lower/equal upfront: wins immediately
    } else if (monthlySaving > 0) {
      breakEvenMonth = Math.ceil(extraUpfront / monthlySaving);
    }
  }

  return {
    loanAmount,
    a: ra,
    b: rb,
    cheaperByTotalCost,
    totalCostGap,
    monthlyGap,
    breakEvenMonth,
    cheaperMonthly,
    bars: [
      { label: "Offer A", interest: ra.totalInterest, upfront: ra.upfrontCost },
      { label: "Offer B", interest: rb.totalInterest, upfront: rb.upfrontCost },
    ],
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
