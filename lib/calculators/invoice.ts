// Pure logic for the Invoice Total Calculator.
// Takes a list of line items (description, quantity, unit price), an optional
// percentage discount, a tax rate and an optional shipping fee, then returns the
// subtotal, discount amount, taxable base, tax and the final invoice total.
// Also exposes a small breakdown array for charting.

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceInput {
  lines: InvoiceLine[];
  discountPct: number; // percentage off the subtotal
  taxRatePct: number; // sales tax / VAT applied after discount
  shipping: number; // flat shipping fee, not taxed
}

export interface InvoiceLineResult {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity times unit price
}

export interface InvoiceBarPoint {
  label: string;
  value: number;
}

export interface InvoiceResult {
  lineResults: InvoiceLineResult[];
  subtotal: number;
  discountAmount: number;
  taxableBase: number; // subtotal minus discount
  taxAmount: number;
  shipping: number;
  total: number;
  breakdown: InvoiceBarPoint[];
}

export function computeInvoice(input: InvoiceInput): InvoiceResult | null {
  const { lines, discountPct, taxRatePct, shipping } = input;

  if (!Number.isFinite(discountPct) || !Number.isFinite(taxRatePct)) return null;
  if (!Number.isFinite(shipping) || shipping < 0) return null;
  if (discountPct < 0 || discountPct > 100) return null;
  if (taxRatePct < 0) return null;
  if (!Array.isArray(lines) || lines.length === 0) return null;

  const lineResults: InvoiceLineResult[] = [];
  let subtotal = 0;

  for (const l of lines) {
    const qty = Number.isFinite(l.quantity) ? l.quantity : 0;
    const price = Number.isFinite(l.unitPrice) ? l.unitPrice : 0;
    if (qty < 0 || price < 0) return null;
    const amount = qty * price;
    subtotal += amount;
    lineResults.push({
      description: l.description,
      quantity: qty,
      unitPrice: price,
      amount,
    });
  }

  const discountAmount = subtotal * (discountPct / 100);
  const taxableBase = subtotal - discountAmount;
  const taxAmount = taxableBase * (taxRatePct / 100);
  const total = taxableBase + taxAmount + shipping;

  const breakdown: InvoiceBarPoint[] = [
    { label: "Net items", value: taxableBase },
    { label: "Tax", value: taxAmount },
    { label: "Shipping", value: shipping },
  ];

  return {
    lineResults,
    subtotal,
    discountAmount,
    taxableBase,
    taxAmount,
    shipping,
    total,
    breakdown,
  };
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
