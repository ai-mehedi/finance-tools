// Pure logic for the Rent Split Calculator.
// Splits a total rent (plus shared utilities) among roommates using one of three
// fairness methods: an even split, a split weighted by each person's private room
// size (square feet), or a split weighted by each person's income. Utilities are
// always shared evenly because they fund the common space everyone uses. Returns a
// per-person breakdown for display and charting.

export type SplitMethod = "even" | "room" | "income";

export interface Roommate {
  name: string;
  roomSize: number; // square feet of their private room
  income: number; // monthly take-home, used for the income-based split
}

export interface RentSplitInput {
  totalRent: number; // total monthly rent for the whole place
  utilities: number; // total monthly shared utilities (electric, water, internet)
  method: SplitMethod;
  roommates: Roommate[];
}

export interface RentShare {
  name: string;
  rentShare: number; // share of the rent only
  utilityShare: number; // even share of utilities
  total: number; // rentShare plus utilityShare
  percent: number; // percent of the total rent this person pays (0-100)
}

export interface RentSplitResult {
  totalRent: number;
  totalUtilities: number;
  grandTotal: number;
  evenBaseline: number; // what each person pays under a plain even split of everything
  shares: RentShare[];
}

export function computeRentSplit(input: RentSplitInput): RentSplitResult | null {
  const { totalRent, utilities, method, roommates } = input;

  if (!Array.isArray(roommates) || roommates.length < 2) return null;
  if (!Number.isFinite(totalRent) || totalRent <= 0) return null;
  if (!Number.isFinite(utilities) || utilities < 0) return null;

  const n = roommates.length;

  // Determine the weight each roommate carries for the rent portion.
  let weights: number[];
  if (method === "room") {
    weights = roommates.map((r) => (Number.isFinite(r.roomSize) && r.roomSize > 0 ? r.roomSize : 0));
  } else if (method === "income") {
    weights = roommates.map((r) => (Number.isFinite(r.income) && r.income > 0 ? r.income : 0));
  } else {
    weights = roommates.map(() => 1);
  }

  let weightSum = weights.reduce((a, b) => a + b, 0);
  // If a weighted method has no usable data, fall back to an even split so the
  // numbers always add up rather than dividing by zero.
  if (weightSum <= 0) {
    weights = roommates.map(() => 1);
    weightSum = n;
  }

  const utilityShare = utilities / n;

  const shares: RentShare[] = roommates.map((r, i) => {
    const fraction = weights[i] / weightSum;
    const rentShare = totalRent * fraction;
    return {
      name: r.name.trim() || `Roommate ${i + 1}`,
      rentShare,
      utilityShare,
      total: rentShare + utilityShare,
      percent: fraction * 100,
    };
  });

  return {
    totalRent,
    totalUtilities: utilities,
    grandTotal: totalRent + utilities,
    evenBaseline: (totalRent + utilities) / n,
    shares,
  };
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
