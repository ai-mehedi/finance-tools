// Pure logic for the Sales Tax Calculator.
// Works in two directions: add sales tax to a pre-tax price, or back out the tax
// already baked into a tax-inclusive total. Returns the net price, the tax
// amount and the gross total, plus a small breakdown schedule for charting.

export type TaxMode = "add" | "extract";

export interface SalesTaxInput {
  amount: number; // pre-tax amount (add) or tax-inclusive total (extract)
  taxRatePct: number;
  mode: TaxMode;
}

export interface SalesTaxBreakdownPoint {
  label: string;
  value: number;
}

export interface SalesTaxResult {
  netAmount: number; // price before tax
  taxAmount: number;
  grossAmount: number; // price including tax
  taxRatePct: number;
  schedule: SalesTaxBreakdownPoint[];
}

export function computeSalesTax(input: SalesTaxInput): SalesTaxResult | null {
  const { amount, taxRatePct, mode } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(taxRatePct) || taxRatePct < 0 || taxRatePct > 100) return null;

  const r = taxRatePct / 100;

  let netAmount: number;
  let taxAmount: number;
  let grossAmount: number;

  if (mode === "add") {
    netAmount = amount;
    taxAmount = amount * r;
    grossAmount = amount + taxAmount;
  } else {
    // amount is the tax-inclusive total; strip the tax back out.
    grossAmount = amount;
    netAmount = amount / (1 + r);
    taxAmount = grossAmount - netAmount;
  }

  const schedule: SalesTaxBreakdownPoint[] = [
    { label: "Net price", value: netAmount },
    { label: "Sales tax", value: taxAmount },
  ];

  return { netAmount, taxAmount, grossAmount, taxRatePct, schedule };
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
