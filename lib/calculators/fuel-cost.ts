// Pure logic for the Fuel Cost Calculator.
// Works out the cost of fuel for a trip from the distance, the vehicle's fuel
// economy in miles per gallon, and the price per gallon. Also projects the cost
// over a year for a regular commute.

export interface FuelCostInput {
  distance: number; // one way distance in miles
  roundTrip: boolean; // double the distance if true
  mpg: number; // miles per gallon
  pricePerGallon: number; // dollars per gallon
  tripsPerWeek: number; // for the annual projection
}

export interface FuelCostResult {
  tripDistance: number; // actual miles driven per trip
  gallonsPerTrip: number;
  costPerTrip: number;
  costPerMile: number;
  annualCost: number; // cost across a year of trips
}

export function computeFuelCost(input: FuelCostInput): FuelCostResult | null {
  const { distance, roundTrip, mpg, pricePerGallon, tripsPerWeek } = input;

  if (!Number.isFinite(distance) || distance <= 0) return null;
  if (!Number.isFinite(mpg) || mpg <= 0) return null;
  if (!Number.isFinite(pricePerGallon) || pricePerGallon < 0) return null;
  if (!Number.isFinite(tripsPerWeek) || tripsPerWeek < 0) return null;

  const tripDistance = roundTrip ? distance * 2 : distance;
  const gallonsPerTrip = tripDistance / mpg;
  const costPerTrip = gallonsPerTrip * pricePerGallon;
  const costPerMile = pricePerGallon / mpg;
  const annualCost = costPerTrip * tripsPerWeek * 52;

  return { tripDistance, gallonsPerTrip, costPerTrip, costPerMile, annualCost };
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
