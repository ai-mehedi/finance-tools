// Pure logic for the Discretionary Income Calculator.
// For US income-driven student loan repayment, discretionary income is your
// adjusted gross income minus a multiple of the federal poverty guideline for
// your household size. Most plans use 150% of the poverty line, while the SAVE
// plan uses 225%. An estimated monthly payment is a share of that figure.

export interface DiscretionaryIncomeInput {
  annualIncome: number; // adjusted gross income
  householdSize: number;
  povertyMultiplePct: number; // 150 for most plans, 225 for SAVE
  paymentPct: number; // share of discretionary income paid per year (e.g. 10)
}

export interface DiscretionaryIncomeResult {
  povertyGuideline: number; // for the household size
  povertyThreshold: number; // guideline times the chosen multiple
  discretionaryIncome: number; // never below 0
  annualPayment: number;
  monthlyPayment: number;
}

// 2024 federal poverty guidelines for the 48 contiguous states and DC.
const POVERTY_BASE = 15060;
const POVERTY_PER_PERSON = 5380;

export function povertyGuideline(householdSize: number): number {
  const size = Math.max(1, Math.floor(householdSize));
  return POVERTY_BASE + POVERTY_PER_PERSON * (size - 1);
}

export function computeDiscretionaryIncome(
  input: DiscretionaryIncomeInput
): DiscretionaryIncomeResult | null {
  const { annualIncome, householdSize, povertyMultiplePct, paymentPct } = input;

  if (!Number.isFinite(annualIncome) || annualIncome < 0) return null;
  if (!Number.isFinite(householdSize) || householdSize < 1) return null;
  if (!Number.isFinite(povertyMultiplePct) || povertyMultiplePct <= 0) return null;
  if (!Number.isFinite(paymentPct) || paymentPct < 0) return null;

  const guideline = povertyGuideline(householdSize);
  const povertyThreshold = guideline * (povertyMultiplePct / 100);
  const discretionaryIncome = Math.max(0, annualIncome - povertyThreshold);
  const annualPayment = discretionaryIncome * (paymentPct / 100);
  const monthlyPayment = annualPayment / 12;

  return {
    povertyGuideline: guideline,
    povertyThreshold,
    discretionaryIncome,
    annualPayment,
    monthlyPayment,
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
