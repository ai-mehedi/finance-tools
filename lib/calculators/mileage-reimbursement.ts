// Pure logic for the Mileage Reimbursement Calculator.
// Computes the dollar amount owed for business (or other) driving by multiplying
// miles driven by a cents-per-mile rate. Supports a quick preset for common IRS
// standard mileage rates and exposes a per-category breakdown for charting.

export type MileagePurpose = "business" | "medical" | "charity" | "custom";

// 2024 IRS standard mileage rates, expressed in cents per mile.
export const STANDARD_RATES: Record<Exclude<MileagePurpose, "custom">, number> = {
  business: 67,
  medical: 21,
  charity: 14,
};

export interface MileageInput {
  miles: number;
  ratePerMileCents: number; // cents per mile
  trips: number; // number of identical trips (multiplier)
  parkingTolls: number; // extra reimbursable dollars not tied to mileage
}

export interface MileageBarPoint {
  label: string;
  value: number;
}

export interface MileageResult {
  totalMiles: number;
  mileageAmount: number; // dollars from miles times rate
  extras: number; // parking and tolls
  total: number; // mileageAmount plus extras
  effectiveRate: number; // blended dollars per mile including extras
  breakdown: MileageBarPoint[];
}

export function computeMileage(input: MileageInput): MileageResult | null {
  const { miles, ratePerMileCents, trips, parkingTolls } = input;

  if (!Number.isFinite(miles) || miles < 0) return null;
  if (!Number.isFinite(ratePerMileCents) || ratePerMileCents < 0) return null;
  if (!Number.isFinite(trips) || trips <= 0) return null;
  if (!Number.isFinite(parkingTolls) || parkingTolls < 0) return null;

  const totalMiles = miles * trips;
  const ratePerMile = ratePerMileCents / 100;
  const mileageAmount = totalMiles * ratePerMile;
  const extras = parkingTolls * trips;
  const total = mileageAmount + extras;
  const effectiveRate = totalMiles > 0 ? total / totalMiles : 0;

  const breakdown: MileageBarPoint[] = [
    { label: "Mileage", value: mileageAmount },
    { label: "Parking & tolls", value: extras },
    { label: "Total", value: total },
  ];

  return { totalMiles, mileageAmount, extras, total, effectiveRate, breakdown };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
