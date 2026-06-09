// Pure logic for the Cost Per Mile Calculator.
// Combines fixed monthly costs (insurance, depreciation, loan, registration)
// and per-mile running costs (fuel, maintenance, tires) into one total cost
// per mile based on how far you drive.

export interface CostPerMileInput {
  milesPerMonth: number;
  // Fixed monthly costs that you pay regardless of distance.
  monthlyInsurance: number;
  monthlyDepreciation: number;
  monthlyLoanPayment: number;
  monthlyOther: number; // registration, parking, etc.
  // Running costs.
  fuelPricePerGallon: number;
  milesPerGallon: number;
  maintenancePerMile: number; // maintenance and tires per mile
}

export interface CostPerMileResult {
  fixedMonthly: number;
  fuelCostPerMile: number;
  variableCostPerMile: number; // fuel + maintenance per mile
  fixedCostPerMile: number; // fixed monthly spread across the miles driven
  totalCostPerMile: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
}

export function computeCostPerMile(input: CostPerMileInput): CostPerMileResult | null {
  const {
    milesPerMonth,
    monthlyInsurance,
    monthlyDepreciation,
    monthlyLoanPayment,
    monthlyOther,
    fuelPricePerGallon,
    milesPerGallon,
    maintenancePerMile,
  } = input;

  if (!Number.isFinite(milesPerMonth) || milesPerMonth <= 0) return null;
  if (!Number.isFinite(milesPerGallon) || milesPerGallon <= 0) return null;
  if (
    monthlyInsurance < 0 ||
    monthlyDepreciation < 0 ||
    monthlyLoanPayment < 0 ||
    monthlyOther < 0 ||
    fuelPricePerGallon < 0 ||
    maintenancePerMile < 0
  ) {
    return null;
  }

  const fixedMonthly =
    monthlyInsurance + monthlyDepreciation + monthlyLoanPayment + monthlyOther;
  const fuelCostPerMile = fuelPricePerGallon / milesPerGallon;
  const variableCostPerMile = fuelCostPerMile + maintenancePerMile;
  const fixedCostPerMile = fixedMonthly / milesPerMonth;
  const totalCostPerMile = fixedCostPerMile + variableCostPerMile;
  const totalMonthlyCost = totalCostPerMile * milesPerMonth;
  const totalAnnualCost = totalMonthlyCost * 12;

  return {
    fixedMonthly,
    fuelCostPerMile,
    variableCostPerMile,
    fixedCostPerMile,
    totalCostPerMile,
    totalMonthlyCost,
    totalAnnualCost,
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

const usd3 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
export const formatUSD3 = (n: number) => usd3.format(Number.isFinite(n) ? n : 0);
