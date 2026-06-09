// Pure logic for the Total Cost of Ownership Calculator. Estimates what a car
// truly costs to own over a number of years: depreciation, financing interest,
// fuel, insurance, maintenance and other recurring costs. Returns an annual
// schedule of cumulative cost for charting.

export interface CarOwnershipInput {
  purchasePrice: number;
  downPayment: number;
  loanRatePct: number; // annual financing rate
  loanTermMonths: number;
  yearsOwned: number;
  resaleValue: number; // expected value at the end of ownership
  annualMiles: number;
  mpg: number; // miles per gallon
  fuelPricePerGallon: number;
  annualInsurance: number;
  annualMaintenance: number;
  annualOther: number; // registration, taxes, parking, etc.
}

export interface OwnershipYearPoint {
  year: number;
  cumulativeCost: number;
}

export interface CarOwnershipResult {
  depreciation: number;
  financingInterest: number;
  fuelCost: number;
  insuranceCost: number;
  maintenanceCost: number;
  otherCost: number;
  totalCost: number;
  costPerYear: number;
  costPerMonth: number;
  costPerMile: number;
  schedule: OwnershipYearPoint[];
}

function loanInterestTotal(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r <= 0) return 0;
  const payment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return payment * months - principal;
}

export function computeCarOwnership(input: CarOwnershipInput): CarOwnershipResult | null {
  const {
    purchasePrice,
    downPayment,
    loanRatePct,
    loanTermMonths,
    yearsOwned,
    resaleValue,
    annualMiles,
    mpg,
    fuelPricePerGallon,
    annualInsurance,
    annualMaintenance,
    annualOther,
  } = input;

  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) return null;
  if (!Number.isFinite(yearsOwned) || yearsOwned <= 0) return null;
  if (mpg <= 0) return null;
  if (
    downPayment < 0 ||
    loanRatePct < 0 ||
    resaleValue < 0 ||
    annualMiles < 0 ||
    fuelPricePerGallon < 0 ||
    annualInsurance < 0 ||
    annualMaintenance < 0 ||
    annualOther < 0
  ) {
    return null;
  }

  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const depreciation = Math.max(0, purchasePrice - resaleValue);
  const financingInterest = loanInterestTotal(loanAmount, loanRatePct, Math.round(loanTermMonths));

  const annualFuel = (annualMiles / mpg) * fuelPricePerGallon;
  const fuelCost = annualFuel * yearsOwned;
  const insuranceCost = annualInsurance * yearsOwned;
  const maintenanceCost = annualMaintenance * yearsOwned;
  const otherCost = annualOther * yearsOwned;

  const totalCost = depreciation + financingInterest + fuelCost + insuranceCost + maintenanceCost + otherCost;

  const annualRecurring = annualFuel + annualInsurance + annualMaintenance + annualOther;
  const perYearDepreciation = depreciation / yearsOwned;
  const perYearInterest = financingInterest / yearsOwned;

  const years = Math.max(1, Math.round(yearsOwned));
  const schedule: OwnershipYearPoint[] = [{ year: 0, cumulativeCost: 0 }];
  let cumulative = 0;
  for (let y = 1; y <= years; y++) {
    cumulative += perYearDepreciation + perYearInterest + annualRecurring;
    schedule.push({ year: y, cumulativeCost: cumulative });
  }

  const totalMiles = annualMiles * yearsOwned;

  return {
    depreciation,
    financingInterest,
    fuelCost,
    insuranceCost,
    maintenanceCost,
    otherCost,
    totalCost,
    costPerYear: totalCost / yearsOwned,
    costPerMonth: totalCost / (yearsOwned * 12),
    costPerMile: totalMiles > 0 ? totalCost / totalMiles : 0,
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
