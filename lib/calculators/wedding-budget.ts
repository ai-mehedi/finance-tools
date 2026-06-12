// Pure logic for the Wedding Budget Calculator.
// Splits a total wedding budget across the usual spending categories using
// typical industry shares, scales the suggestion by guest count where the cost
// is per-head, and reports a per-guest figure plus a category breakdown for a
// donut/bar chart.

export interface WeddingCategory {
  key: string;
  label: string;
  sharePct: number; // typical share of total budget, percent
  perGuest: boolean; // whether this cost scales mainly with headcount
}

// Shares are a common rule-of-thumb split that sums to 100.
export const WEDDING_CATEGORIES: WeddingCategory[] = [
  { key: "venueCatering", label: "Venue & catering", sharePct: 40, perGuest: true },
  { key: "photography", label: "Photography & video", sharePct: 12, perGuest: false },
  { key: "attire", label: "Attire & beauty", sharePct: 8, perGuest: false },
  { key: "flowersDecor", label: "Flowers & decor", sharePct: 10, perGuest: false },
  { key: "music", label: "Music & entertainment", sharePct: 8, perGuest: false },
  { key: "ringsStationery", label: "Rings & stationery", sharePct: 7, perGuest: false },
  { key: "cakeFavors", label: "Cake & favors", sharePct: 3, perGuest: true },
  { key: "planningOther", label: "Planning & extras", sharePct: 12, perGuest: false },
];

export interface WeddingBudgetInput {
  totalBudget: number;
  guests: number;
}

export interface WeddingCategoryResult {
  key: string;
  label: string;
  amount: number;
  sharePct: number; // share of the total this category ends up with
  perGuest: boolean;
}

export interface WeddingBudgetResult {
  totalBudget: number;
  guests: number;
  perGuest: number; // overall cost per guest
  categories: WeddingCategoryResult[];
}

export function computeWeddingBudget(input: WeddingBudgetInput): WeddingBudgetResult | null {
  const { totalBudget, guests } = input;

  if (!Number.isFinite(totalBudget) || totalBudget <= 0) return null;
  if (!Number.isFinite(guests) || guests <= 0) return null;

  // Allocate strictly by the standard shares. Shares already sum to 100, so the
  // category amounts add back to the total budget exactly.
  const categories: WeddingCategoryResult[] = WEDDING_CATEGORIES.map((c) => {
    const amount = totalBudget * (c.sharePct / 100);
    return {
      key: c.key,
      label: c.label,
      amount,
      sharePct: c.sharePct,
      perGuest: c.perGuest,
    };
  });

  const perGuest = totalBudget / guests;

  return { totalBudget, guests, perGuest, categories };
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
