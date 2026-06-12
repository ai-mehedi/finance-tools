// Pure logic for the Tip Calculator.
// Takes a bill amount, a tip percentage and a party size, optionally tipping on
// the pre-tax amount, and returns the tip, the grand total and the per-person
// share. Also exposes a small comparison schedule across common tip rates so
// the page can chart how the total changes as you tip more generously.

export type TipBase = "total" | "pretax"; // tip on the full bill or on the pre-tax subtotal

export interface TipInput {
  billAmount: number; // the bill as printed (may include tax)
  taxPct: number; // sales tax already inside the bill, percent
  tipPct: number; // tip percentage the user chose
  people: number; // number of people splitting
  tipBase: TipBase; // whether to tip on the full bill or the pre-tax subtotal
  roundUp: boolean; // round the per-person share up to the next whole dollar
}

export interface TipComparePoint {
  tipPct: number;
  tip: number;
  total: number;
  perPerson: number;
}

export interface TipResult {
  preTax: number; // subtotal before tax
  tax: number; // tax portion of the bill
  tipBaseAmount: number; // the amount the tip percentage was applied to
  tip: number; // tip in dollars
  total: number; // bill plus tip (after any rounding)
  perPerson: number; // each person's share
  tipPerPerson: number; // each person's slice of the tip
  people: number;
  schedule: TipComparePoint[];
}

const COMPARE_RATES = [10, 15, 18, 20, 25];

export function computeTip(input: TipInput): TipResult | null {
  const { billAmount, taxPct, tipPct, people, tipBase, roundUp } = input;

  if (!Number.isFinite(billAmount) || billAmount < 0) return null;
  if (!Number.isFinite(people) || people < 1) return null;
  if (!Number.isFinite(tipPct) || tipPct < 0) return null;
  if (!Number.isFinite(taxPct) || taxPct < 0) return null;

  // The bill is treated as tax-inclusive: subtotal = bill / (1 + taxRate).
  const taxRate = taxPct / 100;
  const preTax = taxRate > 0 ? billAmount / (1 + taxRate) : billAmount;
  const tax = billAmount - preTax;
  const tipBaseAmount = tipBase === "pretax" ? preTax : billAmount;

  const make = (pct: number): { tip: number; total: number; perPerson: number } => {
    const rawTip = (tipBaseAmount * pct) / 100;
    let total = billAmount + rawTip;
    let tip = rawTip;
    if (roundUp) {
      const roundedTotal = Math.ceil(total);
      tip = rawTip + (roundedTotal - total);
      total = roundedTotal;
    }
    return { tip, total, perPerson: total / people };
  };

  const main = make(tipPct);
  const tipPerPerson = main.tip / people;

  const schedule: TipComparePoint[] = COMPARE_RATES.map((pct) => {
    const m = make(pct);
    return { tipPct: pct, tip: m.tip, total: m.total, perPerson: m.perPerson };
  });

  return {
    preTax,
    tax,
    tipBaseAmount,
    tip: main.tip,
    total: main.total,
    perPerson: main.perPerson,
    tipPerPerson,
    people,
    schedule,
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
  return `$${n.toFixed(2)}`;
}
