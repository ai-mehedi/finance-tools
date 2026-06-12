// Pure logic for the Travel Insurance Calculator.
// Estimates a single-trip travel insurance premium from a base rate that scales
// with trip cost, trip length, traveler age and destination risk, plus optional
// add-ons (cancellation, medical bump, adventure-sports, rental-car). Premiums in
// the travel-insurance market typically land somewhere between 4% and 10% of the
// insured trip cost, so this model targets that range and exposes a per-component
// breakdown for charting.

export type Destination = "domestic" | "europe" | "asia" | "americas" | "worldwide";

export const DEST_FACTOR: Record<Destination, number> = {
  domestic: 0.85,
  europe: 1.0,
  asia: 1.15,
  americas: 1.25, // US medical care drives premiums up
  worldwide: 1.4,
};

export interface TravelInsuranceInput {
  tripCost: number; // total prepaid, non-refundable trip cost
  tripDays: number;
  travelers: number;
  age: number; // age of the oldest traveler
  destination: Destination;
  coverCancellation: boolean;
  medicalUpgrade: boolean;
  adventureSports: boolean;
  rentalCar: boolean;
}

export interface PremiumComponent {
  label: string;
  amount: number;
}

export interface TravelInsuranceResult {
  premium: number; // total estimated premium for the whole party
  perPerson: number;
  perDay: number;
  pctOfTripCost: number; // premium as a percent of trip cost
  components: PremiumComponent[]; // breakdown for the chart
}

// Age loads the premium because older travelers carry higher medical risk.
function ageMultiplier(age: number): number {
  if (age < 30) return 1.0;
  if (age < 45) return 1.15;
  if (age < 60) return 1.45;
  if (age < 70) return 1.9;
  if (age < 80) return 2.6;
  return 3.4;
}

export function computeTravelInsurance(input: TravelInsuranceInput): TravelInsuranceResult | null {
  const { tripCost, tripDays, travelers, age, destination } = input;

  if (!Number.isFinite(tripCost) || tripCost < 0) return null;
  if (!Number.isFinite(tripDays) || tripDays <= 0) return null;
  if (!Number.isFinite(travelers) || travelers < 1) return null;
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;

  const destF = DEST_FACTOR[destination];
  const ageF = ageMultiplier(age);

  // Base medical/evacuation premium scales with days and destination risk, per traveler.
  const baseMedicalPerPerson = (4.2 * tripDays) * destF * ageF;

  // Trip-cancellation coverage is priced as a slice of the insured trip cost.
  const cancellation = input.coverCancellation ? tripCost * 0.055 * destF : 0;

  // Optional upgrades.
  const medicalBump = input.medicalUpgrade ? baseMedicalPerPerson * travelers * 0.35 : 0;
  const adventure = input.adventureSports ? 7 * tripDays * travelers * 0.8 : 0;
  const rental = input.rentalCar ? 9 * Math.min(tripDays, 30) : 0;

  const baseMedical = baseMedicalPerPerson * travelers;

  const components: PremiumComponent[] = [
    { label: "Base medical & evacuation", amount: baseMedical },
    { label: "Trip cancellation", amount: cancellation },
    { label: "Medical upgrade", amount: medicalBump },
    { label: "Adventure sports", amount: adventure },
    { label: "Rental car damage", amount: rental },
  ].filter((c) => c.amount > 0);

  const premium = components.reduce((s, c) => s + c.amount, 0);
  const perPerson = premium / travelers;
  const perDay = premium / tripDays;
  const pctOfTripCost = tripCost > 0 ? (premium / tripCost) * 100 : 0;

  return { premium, perPerson, perDay, pctOfTripCost, components };
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
