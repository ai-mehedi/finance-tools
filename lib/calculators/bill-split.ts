// Pure logic for the Bill Split Calculator.
// Splits a bill evenly across people, optionally adding a tip percentage on the
// pre-tip total. The per-person amount is rounded up to the cent so the group
// always collects at least the full bill.

export interface BillSplitInput {
  billAmount: number;
  tipPct: number;
  people: number;
}

export interface BillSplitResult {
  tipAmount: number;
  grandTotal: number; // bill + tip
  perPerson: number; // rounded up to the nearest cent
  people: number;
}

export function computeBillSplit(input: BillSplitInput): BillSplitResult | null {
  const { billAmount, tipPct, people } = input;

  if (!Number.isFinite(billAmount) || billAmount <= 0) return null;
  if (!Number.isFinite(people) || people < 1) return null;
  if (tipPct < 0 || !Number.isFinite(tipPct)) return null;

  const headcount = Math.floor(people);
  const tipAmount = billAmount * (tipPct / 100);
  const grandTotal = billAmount + tipAmount;
  // Round up to the cent so the collected total covers the bill.
  const perPerson = Math.ceil((grandTotal / headcount) * 100) / 100;

  return { tipAmount, grandTotal, perPerson, people: headcount };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
