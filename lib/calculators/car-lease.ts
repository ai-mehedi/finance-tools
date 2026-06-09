// Pure logic for the Car Lease Calculator.
// Uses the standard lease math: a depreciation charge plus a finance (rent)
// charge, with sales tax applied to the monthly payment.
//
//   adjusted cap cost = price - down payment - trade-in
//   monthly depreciation = (adjusted cap cost - residual) / term
//   monthly finance      = (adjusted cap cost + residual) * money factor
//   money factor         = APR / 2400
//   monthly tax          = (depreciation + finance) * tax rate

export interface CarLeaseInput {
  msrp: number;
  negotiatedPrice: number;
  downPayment: number;
  tradeIn: number;
  residualPct: number; // residual value as a percent of MSRP
  annualRatePct: number; // APR equivalent
  termMonths: number;
  salesTaxPct: number;
}

export interface CarLeaseResult {
  monthlyDepreciation: number;
  monthlyFinance: number;
  monthlyTax: number;
  monthlyPayment: number; // tax included
  residualValue: number;
  adjustedCapCost: number;
  totalLeaseCost: number; // down payment + all monthly payments
  moneyFactor: number;
}

export function computeCarLease(input: CarLeaseInput): CarLeaseResult | null {
  const {
    msrp,
    negotiatedPrice,
    downPayment,
    tradeIn,
    residualPct,
    annualRatePct,
    termMonths,
    salesTaxPct,
  } = input;

  if (!Number.isFinite(negotiatedPrice) || negotiatedPrice <= 0) return null;
  if (!Number.isFinite(msrp) || msrp <= 0) return null;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return null;
  if (annualRatePct < 0 || downPayment < 0 || tradeIn < 0) return null;
  if (residualPct < 0 || residualPct > 100 || salesTaxPct < 0) return null;

  const n = Math.round(termMonths);
  const residualValue = msrp * (residualPct / 100);
  const adjustedCapCost = Math.max(0, negotiatedPrice - downPayment - tradeIn);
  const moneyFactor = annualRatePct / 2400;

  const monthlyDepreciation = (adjustedCapCost - residualValue) / n;
  const monthlyFinance = (adjustedCapCost + residualValue) * moneyFactor;
  const monthlyBase = Math.max(0, monthlyDepreciation + monthlyFinance);
  const monthlyTax = monthlyBase * (salesTaxPct / 100);
  const monthlyPayment = monthlyBase + monthlyTax;

  const totalLeaseCost = downPayment + monthlyPayment * n;

  return {
    monthlyDepreciation: Math.max(0, monthlyDepreciation),
    monthlyFinance: Math.max(0, monthlyFinance),
    monthlyTax,
    monthlyPayment,
    residualValue,
    adjustedCapCost,
    totalLeaseCost,
    moneyFactor,
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
