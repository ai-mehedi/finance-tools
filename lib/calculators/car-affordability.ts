// Pure logic for the Car Affordability Calculator.
// Works backward from a monthly payment budget to the car price you can afford,
// using the standard loan payment formula P = M * (1 - (1+r)^-n) / r solved for P.

export interface CarAffordabilityInput {
  monthlyBudget: number;
  downPayment: number;
  tradeIn: number;
  annualRatePct: number;
  termMonths: number;
  salesTaxPct: number;
  monthlyInsurance: number;
  monthlyOther: number; // fuel, maintenance, registration set aside, etc.
}

export interface CarAffordabilityResult {
  loanAmount: number; // max amount that can be financed
  vehiclePrice: number; // sticker price you can afford (incl. tax)
  preTaxPrice: number; // price before sales tax
  totalUpfront: number; // down payment + trade-in
  monthlyLoanPayment: number; // the loan portion of the budget
  totalInterest: number;
  totalCost: number; // price + interest over the loan
}

export function computeCarAffordability(
  input: CarAffordabilityInput
): CarAffordabilityResult | null {
  const {
    monthlyBudget,
    downPayment,
    tradeIn,
    annualRatePct,
    termMonths,
    salesTaxPct,
    monthlyInsurance,
    monthlyOther,
  } = input;

  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) return null;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return null;
  if (annualRatePct < 0 || downPayment < 0 || tradeIn < 0 || salesTaxPct < 0) return null;
  if (monthlyInsurance < 0 || monthlyOther < 0) return null;

  // The loan payment is whatever is left after running costs.
  const monthlyLoanPayment = monthlyBudget - monthlyInsurance - monthlyOther;
  if (monthlyLoanPayment <= 0) {
    return {
      loanAmount: 0,
      vehiclePrice: Math.max(0, downPayment + tradeIn),
      preTaxPrice: Math.max(0, downPayment + tradeIn),
      totalUpfront: downPayment + tradeIn,
      monthlyLoanPayment: 0,
      totalInterest: 0,
      totalCost: Math.max(0, downPayment + tradeIn),
    };
  }

  const r = annualRatePct / 100 / 12;
  const n = Math.round(termMonths);

  const loanAmount =
    r > 0
      ? (monthlyLoanPayment * (1 - Math.pow(1 + r, -n))) / r
      : monthlyLoanPayment * n;

  const totalUpfront = downPayment + tradeIn;
  // Loan + upfront covers the taxed-inclusive vehicle price.
  const vehiclePrice = loanAmount + totalUpfront;
  const preTaxPrice = vehiclePrice / (1 + salesTaxPct / 100);

  const totalInterest = monthlyLoanPayment * n - loanAmount;
  const totalCost = vehiclePrice + totalInterest;

  return {
    loanAmount,
    vehiclePrice,
    preTaxPrice,
    totalUpfront,
    monthlyLoanPayment,
    totalInterest,
    totalCost,
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
