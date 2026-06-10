// Pure logic for the Marginal Tax Rate Calculator.
// Applies progressive tax brackets to a taxable income and returns the total
// tax, the effective (average) rate and the marginal rate — the rate on the
// next dollar earned. Also returns a per-bracket schedule for charting how much
// tax each band contributes.

export type FilingStatus = "single" | "married" | "head";

export interface TaxBracket {
  // Tax owed on income falling within (lower, upper] at this rate.
  rate: number; // e.g. 0.22 for 22%
  lower: number;
  upper: number; // Infinity for the top bracket
}

// 2024 US federal ordinary-income brackets (illustrative).
export const BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.1, lower: 0, upper: 11600 },
    { rate: 0.12, lower: 11600, upper: 47150 },
    { rate: 0.22, lower: 47150, upper: 100525 },
    { rate: 0.24, lower: 100525, upper: 191950 },
    { rate: 0.32, lower: 191950, upper: 243725 },
    { rate: 0.35, lower: 243725, upper: 609350 },
    { rate: 0.37, lower: 609350, upper: Infinity },
  ],
  married: [
    { rate: 0.1, lower: 0, upper: 23200 },
    { rate: 0.12, lower: 23200, upper: 94300 },
    { rate: 0.22, lower: 94300, upper: 201050 },
    { rate: 0.24, lower: 201050, upper: 383900 },
    { rate: 0.32, lower: 383900, upper: 487450 },
    { rate: 0.35, lower: 487450, upper: 731200 },
    { rate: 0.37, lower: 731200, upper: Infinity },
  ],
  head: [
    { rate: 0.1, lower: 0, upper: 16550 },
    { rate: 0.12, lower: 16550, upper: 63100 },
    { rate: 0.22, lower: 63100, upper: 100500 },
    { rate: 0.24, lower: 100500, upper: 191950 },
    { rate: 0.32, lower: 191950, upper: 243700 },
    { rate: 0.35, lower: 243700, upper: 609350 },
    { rate: 0.37, lower: 609350, upper: Infinity },
  ],
};

export interface MarginalTaxRateInput {
  taxableIncome: number;
  status: FilingStatus;
}

export interface BracketTaxPoint {
  rate: number; // as percent, e.g. 22
  taxedAmount: number; // income taxed in this band
  taxInBand: number; // tax owed from this band
}

export interface MarginalTaxRateResult {
  taxableIncome: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveRatePct: number;
  marginalRatePct: number;
  schedule: BracketTaxPoint[];
}

export function computeMarginalTaxRate(
  input: MarginalTaxRateInput,
): MarginalTaxRateResult | null {
  const { taxableIncome, status } = input;

  if (!Number.isFinite(taxableIncome) || taxableIncome < 0) return null;

  const brackets = BRACKETS[status];
  if (!brackets) return null;

  let totalTax = 0;
  let marginalRatePct = brackets[0].rate * 100;
  const schedule: BracketTaxPoint[] = [];

  for (const b of brackets) {
    if (taxableIncome > b.lower) {
      const taxedAmount = Math.min(taxableIncome, b.upper) - b.lower;
      const taxInBand = taxedAmount * b.rate;
      totalTax += taxInBand;
      marginalRatePct = b.rate * 100;
      schedule.push({
        rate: b.rate * 100,
        taxedAmount,
        taxInBand,
      });
    }
  }

  const afterTaxIncome = taxableIncome - totalTax;
  const effectiveRatePct = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    taxableIncome,
    totalTax,
    afterTaxIncome,
    effectiveRatePct,
    marginalRatePct,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
