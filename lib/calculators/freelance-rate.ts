// Pure logic for the Freelance Rate Calculator.
// Works out the hourly rate a freelancer must charge so that, after unpaid time,
// business costs and taxes, the take-home target is still met. The core idea is to
// total the money you must collect in a year, then divide by the hours you can
// actually bill.

export interface FreelanceRateInput {
  targetIncome: number; // desired annual take-home pay
  businessCosts: number; // annual software, equipment, insurance, etc.
  taxRatePct: number; // effective tax rate on gross revenue
  billableHoursPerWeek: number; // hours you can actually invoice
  workWeeksPerYear: number; // working weeks after holidays and time off
}

export interface FreelanceRateResult {
  billableHoursPerYear: number;
  grossRevenueNeeded: number; // revenue before tax that hits the target
  taxAmount: number;
  hourlyRate: number;
  dayRate: number; // assumes an 8 hour billable day
}

export function computeFreelanceRate(input: FreelanceRateInput): FreelanceRateResult | null {
  const { targetIncome, businessCosts, taxRatePct, billableHoursPerWeek, workWeeksPerYear } = input;

  if (!Number.isFinite(targetIncome) || targetIncome < 0) return null;
  if (!Number.isFinite(businessCosts) || businessCosts < 0) return null;
  if (!Number.isFinite(taxRatePct) || taxRatePct < 0 || taxRatePct >= 100) return null;
  if (!Number.isFinite(billableHoursPerWeek) || billableHoursPerWeek <= 0) return null;
  if (!Number.isFinite(workWeeksPerYear) || workWeeksPerYear <= 0) return null;

  const billableHoursPerYear = billableHoursPerWeek * workWeeksPerYear;

  // Money you need to keep after tax = take-home target + business costs.
  const afterTaxNeeded = targetIncome + businessCosts;
  // Gross it up so that what survives the tax rate equals afterTaxNeeded.
  const grossRevenueNeeded = afterTaxNeeded / (1 - taxRatePct / 100);
  const taxAmount = grossRevenueNeeded - afterTaxNeeded;

  const hourlyRate = grossRevenueNeeded / billableHoursPerYear;
  const dayRate = hourlyRate * 8;

  return { billableHoursPerYear, grossRevenueNeeded, taxAmount, hourlyRate, dayRate };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
export const formatUSD0 = (n: number) => usd0.format(Number.isFinite(n) ? n : 0);
