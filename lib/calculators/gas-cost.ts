// Pure logic for the Gas Cost Calculator.
// Estimates the fuel cost of a trip from the distance, the vehicle's fuel
// economy in miles per gallon and the price of gas per gallon. Supports a
// round-trip option that doubles the distance, and derives gallons used and
// a cost-per-mile figure for the journey.

export interface GasCostInput {
  distance: number; // one-way trip distance in miles
  mpg: number; // fuel efficiency in miles per gallon
  price: number; // gas price per gallon, in dollars
  roundTrip: boolean; // when true, the distance is travelled there and back
}

export interface GasCostResult {
  effectiveDistance: number; // miles actually driven (doubled for round trips)
  gallons: number; // gallons of fuel the trip consumes
  totalCost: number; // total fuel cost of the trip
  costPerMile: number; // fuel cost per mile driven
}

export function computeGasCost(input: GasCostInput): GasCostResult | null {
  const { distance, mpg, price, roundTrip } = input;

  if (!Number.isFinite(distance) || distance <= 0) return null;
  if (!Number.isFinite(mpg) || mpg <= 0) return null;
  if (!Number.isFinite(price) || price < 0) return null;

  const effectiveDistance = roundTrip ? distance * 2 : distance;
  const gallons = effectiveDistance / mpg;
  const totalCost = gallons * price;
  const costPerMile = totalCost / effectiveDistance;

  return {
    effectiveDistance,
    gallons,
    totalCost,
    costPerMile,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

// Cost-per-mile is typically a few cents, so round dollar formatting hides it.
// Show 2-3 decimals so small per-mile figures stay readable.
export function formatCostPerMile(n: number): string {
  if (!Number.isFinite(n)) return "$0.000";
  return `$${n.toFixed(3)}`;
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
