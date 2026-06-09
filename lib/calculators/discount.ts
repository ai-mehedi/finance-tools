// Pure logic for the Discount Calculator.
// Applies a percentage discount to an original price, optionally adds a sales
// tax on the discounted price, and reports the amount saved and final cost.

export interface DiscountInput {
  originalPrice: number;
  discountPct: number;
  taxPct?: number;
}

export interface DiscountResult {
  originalPrice: number;
  discountPct: number;
  savings: number; // amount taken off by the discount
  priceAfterDiscount: number; // before tax
  tax: number; // tax charged on the discounted price
  finalPrice: number; // what you actually pay
}

export function computeDiscount(input: DiscountInput): DiscountResult | null {
  const { originalPrice, discountPct, taxPct = 0 } = input;

  if (!Number.isFinite(originalPrice) || originalPrice < 0) return null;
  if (!Number.isFinite(discountPct) || discountPct < 0 || discountPct > 100) return null;
  if (!Number.isFinite(taxPct) || taxPct < 0) return null;

  const savings = originalPrice * (discountPct / 100);
  const priceAfterDiscount = originalPrice - savings;
  const tax = priceAfterDiscount * (taxPct / 100);
  const finalPrice = priceAfterDiscount + tax;

  return {
    originalPrice,
    discountPct,
    savings,
    priceAfterDiscount,
    tax,
    finalPrice,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
