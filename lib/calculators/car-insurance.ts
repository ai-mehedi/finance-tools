// Pure logic for the Car Insurance Calculator.
// Estimates an annual premium from a base rate adjusted by common rating
// factors: driver age, vehicle value, coverage level, driving record,
// annual mileage and location risk. This is an estimate, not a quote.

export type CoverageLevel = "liability" | "standard" | "full";
export type DriverAge = "under25" | "25to65" | "over65";
export type DrivingRecord = "clean" | "minor" | "major";
export type LocationRisk = "low" | "medium" | "high";

export interface CarInsuranceInput {
  vehicleValue: number;
  age: DriverAge;
  coverage: CoverageLevel;
  record: DrivingRecord;
  annualMileage: number;
  location: LocationRisk;
}

export interface CarInsuranceResult {
  annualPremium: number;
  monthlyPremium: number;
  baseRate: number;
  ageFactor: number;
  coverageFactor: number;
  recordFactor: number;
  mileageFactor: number;
  locationFactor: number;
}

const AGE_FACTOR: Record<DriverAge, number> = {
  under25: 1.5,
  "25to65": 1.0,
  over65: 1.15,
};

const COVERAGE_FACTOR: Record<CoverageLevel, number> = {
  liability: 0.7,
  standard: 1.0,
  full: 1.35,
};

const RECORD_FACTOR: Record<DrivingRecord, number> = {
  clean: 1.0,
  minor: 1.25,
  major: 1.8,
};

const LOCATION_FACTOR: Record<LocationRisk, number> = {
  low: 0.85,
  medium: 1.0,
  high: 1.3,
};

export function computeCarInsurance(
  input: CarInsuranceInput
): CarInsuranceResult | null {
  const { vehicleValue, age, coverage, record, annualMileage, location } = input;

  if (!Number.isFinite(vehicleValue) || vehicleValue < 0) return null;
  if (!Number.isFinite(annualMileage) || annualMileage < 0) return null;

  // Base rate has a flat component plus a slice of the vehicle value, since
  // pricier cars cost more to repair or replace.
  const baseRate = 600 + vehicleValue * 0.02;

  const ageFactor = AGE_FACTOR[age];
  const coverageFactor = COVERAGE_FACTOR[coverage];
  const recordFactor = RECORD_FACTOR[record];
  const locationFactor = LOCATION_FACTOR[location];

  // More miles means more exposure. 12,000 mi/yr is the neutral baseline.
  const mileageFactor = 0.85 + (annualMileage / 12000) * 0.15;

  const annualPremium =
    baseRate *
    ageFactor *
    coverageFactor *
    recordFactor *
    locationFactor *
    mileageFactor;

  return {
    annualPremium,
    monthlyPremium: annualPremium / 12,
    baseRate,
    ageFactor,
    coverageFactor,
    recordFactor,
    mileageFactor,
    locationFactor,
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
