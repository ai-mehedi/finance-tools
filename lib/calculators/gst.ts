// Pure logic for the GST (Goods and Services Tax) Calculator.
// Supports adding GST to a base (exclusive) amount or extracting GST from a
// price that already includes tax (inclusive). Splits the GST into CGST/SGST
// for intra-state supply, or treats it as a single IGST for inter-state supply.

export type GstMode = "exclusive" | "inclusive";
export type SupplyType = "intra" | "inter";

export const GST_SLABS = [0, 3, 5, 12, 18, 28];

export interface GstInput {
  amount: number; // base amount (exclusive) or final price (inclusive)
  ratePct: number; // GST rate, e.g. 18
  mode: GstMode;
  supply: SupplyType;
}

export interface GstResult {
  baseAmount: number; // net amount before GST
  gstAmount: number; // total GST
  totalAmount: number; // gross amount including GST
  cgst: number; // central GST (half of total for intra-state)
  sgst: number; // state GST (half of total for intra-state)
  igst: number; // integrated GST (full total for inter-state)
  ratePct: number;
  supply: SupplyType;
}

export function computeGst(input: GstInput): GstResult | null {
  const { amount, ratePct, mode, supply } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(ratePct) || ratePct < 0) return null;

  const r = ratePct / 100;

  let baseAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (mode === "inclusive") {
    // The supplied amount already contains GST; strip it back out.
    totalAmount = amount;
    baseAmount = amount / (1 + r);
    gstAmount = totalAmount - baseAmount;
  } else {
    baseAmount = amount;
    gstAmount = amount * r;
    totalAmount = baseAmount + gstAmount;
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (supply === "intra") {
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  } else {
    igst = gstAmount;
  }

  return { baseAmount, gstAmount, totalAmount, cgst, sgst, igst, ratePct, supply };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
