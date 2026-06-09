// Pure logic for the Cashback Rewards Calculator.
// Estimates yearly cashback earned across spending categories with their own
// reward rates, then subtracts any annual card fee to show net rewards.

export interface CashbackCategory {
  monthlySpend: number;
  ratePct: number; // cashback rate for this category
}

export interface CashbackInput {
  categories: CashbackCategory[];
  annualFee: number;
}

export interface CashbackResult {
  monthlyCashback: number;
  annualCashback: number;
  netAnnualCashback: number; // after the annual fee
  effectiveRatePct: number; // annual cashback / annual spend
  totalAnnualSpend: number;
}

export function computeCashback(input: CashbackInput): CashbackResult | null {
  const { categories, annualFee } = input;
  if (!Number.isFinite(annualFee) || annualFee < 0) return null;
  if (categories.length === 0) return null;

  let monthlyCashback = 0;
  let monthlySpend = 0;
  for (const c of categories) {
    if (!Number.isFinite(c.monthlySpend) || c.monthlySpend < 0) return null;
    if (!Number.isFinite(c.ratePct) || c.ratePct < 0) return null;
    monthlyCashback += c.monthlySpend * (c.ratePct / 100);
    monthlySpend += c.monthlySpend;
  }

  const annualCashback = monthlyCashback * 12;
  const totalAnnualSpend = monthlySpend * 12;
  const netAnnualCashback = annualCashback - annualFee;
  const effectiveRatePct = totalAnnualSpend > 0 ? (annualCashback / totalAnnualSpend) * 100 : 0;

  return {
    monthlyCashback,
    annualCashback,
    netAnnualCashback,
    effectiveRatePct,
    totalAnnualSpend,
  };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
