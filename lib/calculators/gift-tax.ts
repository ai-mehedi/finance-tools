// Pure logic for the US federal Gift Tax Calculator.
// Each year you can give up to the annual exclusion per recipient with no
// reporting. Gifts above that reduce your lifetime exemption. Actual gift tax
// is owed only once the lifetime exemption is used up, and the top federal rate
// is 40 percent. State gift tax and special rules are not modeled here.

export interface GiftTaxInput {
  giftAmount: number;
  recipients: number;
  isMarried: boolean; // gift splitting doubles the annual exclusion per recipient
  lifetimeUsed: number; // exemption already used in prior years
  annualExclusion: number; // per recipient, per donor
  lifetimeExemption: number; // per donor
}

export interface GiftTaxResult {
  effectiveExclusion: number; // total annual exclusion across all recipients
  excludedAmount: number; // covered by the annual exclusion, never taxed
  taxableGift: number; // amount that counts against the lifetime exemption
  exemptionRemainingBefore: number;
  exemptionApplied: number; // taxable gift absorbed by remaining exemption
  exemptionRemainingAfter: number;
  amountOverExemption: number; // portion with no exemption left
  giftTaxDue: number; // 40 percent of the amount over exemption
}

const TOP_RATE = 0.4;

export function computeGiftTax(input: GiftTaxInput): GiftTaxResult | null {
  const {
    giftAmount,
    recipients,
    isMarried,
    lifetimeUsed,
    annualExclusion,
    lifetimeExemption,
  } = input;

  if (!Number.isFinite(giftAmount) || giftAmount < 0) return null;
  if (!Number.isFinite(recipients) || recipients < 1) return null;
  if (annualExclusion < 0 || lifetimeExemption < 0 || lifetimeUsed < 0) return null;

  const perRecipient = annualExclusion * (isMarried ? 2 : 1);
  const effectiveExclusion = perRecipient * Math.floor(recipients);

  const excludedAmount = Math.min(giftAmount, effectiveExclusion);
  const taxableGift = Math.max(0, giftAmount - effectiveExclusion);

  const exemptionRemainingBefore = Math.max(0, lifetimeExemption - lifetimeUsed);
  const exemptionApplied = Math.min(taxableGift, exemptionRemainingBefore);
  const exemptionRemainingAfter = exemptionRemainingBefore - exemptionApplied;
  const amountOverExemption = taxableGift - exemptionApplied;
  const giftTaxDue = amountOverExemption * TOP_RATE;

  return {
    effectiveExclusion,
    excludedAmount,
    taxableGift,
    exemptionRemainingBefore,
    exemptionApplied,
    exemptionRemainingAfter,
    amountOverExemption,
    giftTaxDue,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
