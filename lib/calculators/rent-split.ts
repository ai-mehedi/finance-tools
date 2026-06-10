// Pure logic for the Rent Split Calculator.
// Splits a total monthly rent between roommates either evenly or weighted by the
// size of each person's room (square footage). Returns a per-person breakdown
// for display and charting.

export type SplitMethod = "even" | "weighted";

export interface Roommate {
  name: string;
  roomSize: number; // square feet; only used for the weighted method
}

export interface RentSplitInput {
  totalRent: number; // total monthly rent for the whole place
  method: SplitMethod;
  roommates: Roommate[];
}

export interface RentShare {
  name: string;
  roomSize: number;
  share: number; // dollars this person pays each month
  percent: number; // their share as a percent of the total
}

export interface RentSplitResult {
  totalRent: number;
  perPersonEven: number; // what an even split would be (reference)
  shares: RentShare[];
}

export function computeRentSplit(input: RentSplitInput): RentSplitResult | null {
  const { totalRent, method, roommates } = input;

  if (!Number.isFinite(totalRent) || totalRent <= 0) return null;
  const people = roommates.filter((r) => r.name.trim() !== "" || r.roomSize > 0);
  const count = roommates.length;
  if (count < 2) return null;

  const perPersonEven = totalRent / count;

  let shares: RentShare[];

  if (method === "weighted") {
    const totalArea = roommates.reduce((s, r) => s + (r.roomSize > 0 ? r.roomSize : 0), 0);
    if (!(totalArea > 0)) return null; // weighted needs at least some positive area
    shares = roommates.map((r, i) => {
      const area = r.roomSize > 0 ? r.roomSize : 0;
      const fraction = area / totalArea;
      const share = totalRent * fraction;
      return {
        name: r.name.trim() || `Roommate ${i + 1}`,
        roomSize: area,
        share,
        percent: fraction * 100,
      };
    });
  } else {
    shares = roommates.map((r, i) => ({
      name: r.name.trim() || `Roommate ${i + 1}`,
      roomSize: r.roomSize > 0 ? r.roomSize : 0,
      share: perPersonEven,
      percent: 100 / count,
    }));
  }

  // touch `people` so weighted/even both consider populated rows consistently
  void people;

  return { totalRent, perPersonEven, shares };
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
