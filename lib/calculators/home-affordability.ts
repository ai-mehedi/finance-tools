// Pure logic for the Home Affordability Calculator.
// Works out the largest home price a buyer can afford by capping the monthly
// mortgage payment (principal, interest, taxes, insurance) at a share of gross
// income while leaving room for existing debts, then backs out the loan and
// price that fit. Exposes a breakdown of the affordable monthly payment.

export interface HomeAffordabilityInput {
  annualIncome: number;
  monthlyDebts: number; // car loans, student loans, credit cards, etc.
  downPayment: number; // cash available for the down payment
  annualRatePct: number; // mortgage interest rate
  termYears: number; // loan length (e.g. 30)
  dtiPct: number; // max total debt-to-income ratio (back-end), e.g. 36
  propertyTaxPct: number; // annual property tax as % of home price
  annualInsurance: number; // homeowners insurance per year, USD
}

export interface PaymentSlice {
  label: string;
  value: number; // monthly USD
}

export interface HomeAffordabilityResult {
  homePrice: number;
  loanAmount: number;
  maxMonthlyPayment: number; // total budget for housing (PITI)
  principalInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  slices: PaymentSlice[];
}

export function computeHomeAffordability(
  input: HomeAffordabilityInput
): HomeAffordabilityResult | null {
  const {
    annualIncome,
    monthlyDebts,
    downPayment,
    annualRatePct,
    termYears,
    dtiPct,
    propertyTaxPct,
    annualInsurance,
  } = input;

  if (!Number.isFinite(annualIncome) || annualIncome <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (monthlyDebts < 0 || downPayment < 0 || annualInsurance < 0) return null;
  if (dtiPct <= 0 || dtiPct > 100) return null;

  const monthlyIncome = annualIncome / 12;
  // Total monthly housing budget = (DTI cap * income) minus existing debts.
  const maxTotalDebt = (dtiPct / 100) * monthlyIncome;
  const maxMonthlyPayment = Math.max(0, maxTotalDebt - monthlyDebts);

  const monthlyInsurance = annualInsurance / 12;
  const taxRateMonthly = propertyTaxPct / 100 / 12;

  // Budget left for principal + interest after insurance.
  const piBudget = maxMonthlyPayment - monthlyInsurance;
  if (piBudget <= 0) {
    return {
      homePrice: downPayment,
      loanAmount: 0,
      maxMonthlyPayment,
      principalInterest: 0,
      monthlyTax: 0,
      monthlyInsurance,
      slices: buildSlices(0, 0, monthlyInsurance),
    };
  }

  const n = Math.round(termYears * 12);
  const i = annualRatePct / 100 / 12;

  // Mortgage payment factor: P&I per dollar of loan.
  // PI = L * f  =>  L = PI / f.  Each $1 of price also carries a monthly tax of
  // taxRateMonthly, so price affordability solves:
  //   piBudget = (price - down) * f + price * taxRateMonthly
  // Solve for price.
  const f =
    i > 0 ? (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : 1 / n;

  // piBudget = (price - down)*f + price*taxRateMonthly
  // piBudget + down*f = price*(f + taxRateMonthly)
  const price = (piBudget + downPayment * f) / (f + taxRateMonthly);
  const homePrice = Math.max(downPayment, price);
  const loanAmount = Math.max(0, homePrice - downPayment);

  const principalInterest = loanAmount * f;
  const monthlyTax = homePrice * taxRateMonthly;

  return {
    homePrice,
    loanAmount,
    maxMonthlyPayment,
    principalInterest,
    monthlyTax,
    monthlyInsurance,
    slices: buildSlices(principalInterest, monthlyTax, monthlyInsurance),
  };
}

function buildSlices(pi: number, tax: number, ins: number): PaymentSlice[] {
  return [
    { label: "Principal & interest", value: pi },
    { label: "Property tax", value: tax },
    { label: "Homeowners insurance", value: ins },
  ];
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
