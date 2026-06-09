// Pure logic for the Effective Tax Rate Calculator.
// The effective tax rate is the share of your total income that you actually
// pay in tax: effective rate = total tax / total income. This differs from your
// marginal rate, which only applies to your last dollar of income.

export interface EffectiveTaxRateInput {
  income: number; // total or taxable income
  taxPaid: number; // total income tax paid
}

export interface EffectiveTaxRateResult {
  effectiveRate: number; // percent
  takeHome: number; // income minus tax
  takeHomeRate: number; // percent of income kept
}

export function computeEffectiveTaxRate(
  input: EffectiveTaxRateInput
): EffectiveTaxRateResult | null {
  const { income, taxPaid } = input;

  if (!Number.isFinite(income) || income <= 0) return null;
  if (!Number.isFinite(taxPaid) || taxPaid < 0) return null;

  const effectiveRate = (taxPaid / income) * 100;
  const takeHome = income - taxPaid;
  const takeHomeRate = (takeHome / income) * 100;

  return { effectiveRate, takeHome, takeHomeRate };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
