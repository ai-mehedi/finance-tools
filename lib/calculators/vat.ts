// Pure logic for the VAT (Value Added Tax) Calculator.
// Supports two modes: adding VAT onto a net (VAT-exclusive) price, or removing
// VAT from a gross (VAT-inclusive) price to recover the net amount and the tax.

export type VatMode = "add" | "remove";

export interface VatInput {
  amount: number; // the figure typed in: net when adding, gross when removing
  ratePct: number; // VAT rate as a percentage, e.g. 20
  mode: VatMode;
}

export interface VatResult {
  net: number; // price before VAT
  vat: number; // the VAT amount
  gross: number; // price including VAT
  ratePct: number;
  mode: VatMode;
}

export function computeVat(input: VatInput): VatResult | null {
  const { amount, ratePct, mode } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(ratePct) || ratePct < 0) return null;

  const rate = ratePct / 100;

  let net: number;
  let gross: number;

  if (mode === "remove") {
    // amount is VAT-inclusive (gross); back out the net.
    gross = amount;
    net = amount / (1 + rate);
  } else {
    // amount is VAT-exclusive (net); add VAT on top.
    net = amount;
    gross = amount * (1 + rate);
  }

  const vat = gross - net;

  return { net, vat, gross, ratePct, mode };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

// A version with cents, handy for tax amounts where rounding to whole dollars hides detail.
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
