// Pure logic for the Gold Loan Calculator.
// Estimates the maximum loan you can raise against pledged gold based on its
// weight, purity and current market rate, capped by a loan-to-value (LTV)
// ratio. Then computes EMI for the chosen tenure using the standard reducing
// balance formula, plus a per-year outstanding-balance schedule for charting.

export interface GoldLoanInput {
  weightGrams: number; // weight of gold pledged, in grams
  purityKarat: number; // 24, 22, 18 etc.
  ratePerGram24k: number; // market rate per gram of pure (24K) gold
  ltvPct: number; // loan-to-value cap, e.g. 75
  annualRatePct: number; // loan interest rate per year
  tenureMonths: number; // repayment tenure in months
}

export interface GoldLoanYearPoint {
  year: number;
  balance: number; // outstanding principal at year end
  principalPaid: number; // cumulative principal repaid
}

export interface GoldLoanResult {
  goldValue: number; // appraised value of the pledged gold
  eligibleLoan: number; // value times LTV cap
  emi: number; // monthly instalment
  totalInterest: number; // total interest over the tenure
  totalPayment: number; // principal plus interest
  schedule: GoldLoanYearPoint[];
}

export function computeGoldLoan(input: GoldLoanInput): GoldLoanResult | null {
  const {
    weightGrams,
    purityKarat,
    ratePerGram24k,
    ltvPct,
    annualRatePct,
    tenureMonths,
  } = input;

  if (!Number.isFinite(weightGrams) || weightGrams <= 0) return null;
  if (!Number.isFinite(purityKarat) || purityKarat <= 0 || purityKarat > 24) return null;
  if (!Number.isFinite(ratePerGram24k) || ratePerGram24k < 0) return null;
  if (!Number.isFinite(ltvPct) || ltvPct < 0 || ltvPct > 100) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(tenureMonths) || tenureMonths <= 0) return null;

  // Purity-adjusted rate: 22K gold is worth 22/24 of the pure rate.
  const purityFactor = purityKarat / 24;
  const goldValue = weightGrams * ratePerGram24k * purityFactor;
  const eligibleLoan = goldValue * (ltvPct / 100);

  const principal = eligibleLoan;
  const i = annualRatePct / 100 / 12;
  const n = Math.round(tenureMonths);

  let emi: number;
  if (i === 0) {
    emi = principal / n;
  } else {
    emi = (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  }

  // Amortise to build the yearly schedule.
  let balance = principal;
  let principalPaidCum = 0;
  const schedule: GoldLoanYearPoint[] = [
    { year: 0, balance: principal, principalPaid: 0 },
  ];
  for (let m = 1; m <= n; m++) {
    const interestPart = balance * i;
    const principalPart = emi - interestPart;
    balance = Math.max(0, balance - principalPart);
    principalPaidCum += principalPart;
    if (m % 12 === 0 || m === n) {
      schedule.push({
        year: m / 12,
        balance,
        principalPaid: principalPaidCum,
      });
    }
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  return { goldValue, eligibleLoan, emi, totalInterest, totalPayment, schedule };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
