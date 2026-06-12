// Pure logic for the Split Bill Calculator.
// Splits a restaurant or group bill across people, adding tip and (optionally)
// tax, and supports splitting evenly or by uneven shares. Returns a per-person
// breakdown so the UI can show exactly who owes what.

export type SplitMode = "even" | "shares";

export interface SplitBillInput {
  billAmount: number; // pre-tip subtotal entered by the user
  taxPct: number; // sales tax as a percent of the bill
  tipPct: number; // tip as a percent of the bill (pre-tax convention)
  people: number; // number of people sharing
  mode: SplitMode; // even split or weighted shares
  shares: number[]; // weights per person, used only in "shares" mode
  roundUp: boolean; // round each person's share up to the next dollar
}

export interface PersonShare {
  index: number; // 1-based person number
  weight: number; // share weight (1 for even split)
  amount: number; // what this person pays
}

export interface SplitBillResult {
  bill: number;
  tax: number;
  tip: number;
  total: number; // bill plus tax plus tip
  perPersonEven: number; // total divided by people (before rounding)
  shares: PersonShare[];
  roundingCollected: number; // extra cents collected if rounding up
}

export function computeSplitBill(input: SplitBillInput): SplitBillResult | null {
  const { billAmount, taxPct, tipPct, people, mode, shares, roundUp } = input;

  if (!Number.isFinite(people) || people < 1) return null;
  if (!Number.isFinite(billAmount) || billAmount < 0) return null;
  if (!Number.isFinite(taxPct) || taxPct < 0) return null;
  if (!Number.isFinite(tipPct) || tipPct < 0) return null;

  const headCount = Math.floor(people);
  const tax = billAmount * (taxPct / 100);
  const tip = billAmount * (tipPct / 100);
  const total = billAmount + tax + tip;
  const perPersonEven = total / headCount;

  // Determine weights for each person.
  let weights: number[];
  if (mode === "shares") {
    weights = Array.from({ length: headCount }, (_, i) => {
      const w = Number.isFinite(shares[i]) ? shares[i] : 1;
      return w > 0 ? w : 0;
    });
    const sum = weights.reduce((a, b) => a + b, 0);
    if (sum <= 0) return null;
  } else {
    weights = Array.from({ length: headCount }, () => 1);
  }

  const weightSum = weights.reduce((a, b) => a + b, 0);

  const personShares: PersonShare[] = weights.map((w, i) => ({
    index: i + 1,
    weight: w,
    amount: total * (w / weightSum),
  }));

  let roundingCollected = 0;
  if (roundUp) {
    for (const p of personShares) {
      const up = Math.ceil(p.amount);
      roundingCollected += up - p.amount;
      p.amount = up;
    }
  }

  return {
    bill: billAmount,
    tax,
    tip,
    total,
    perPersonEven,
    shares: personShares,
    roundingCollected,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
