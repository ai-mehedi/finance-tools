// Pure logic for the Crypto Tax Calculator.
// Estimates US federal capital gains tax on a single crypto disposal. Short-term
// gains (held one year or less) are taxed as ordinary income; long-term gains
// (held more than one year) get preferential brackets that depend on taxable
// income and filing status. This is an estimate of the capital gains piece only.

export type FilingStatus = "single" | "married" | "head";

export interface CryptoTaxInput {
  proceeds: number; // amount received when selling/disposing, in USD
  costBasis: number; // what you originally paid, in USD
  heldLongTerm: boolean; // true if held more than one year
  taxableIncome: number; // other taxable income, used to place long-term gains
  filingStatus: FilingStatus;
  shortTermRatePct: number; // marginal ordinary-income rate for short-term gains
}

export interface CryptoTaxBracketSlice {
  ratePct: number; // 0, 15 or 20
  amount: number; // portion of the long-term gain taxed at this rate
  tax: number;
}

export interface CryptoTaxResult {
  gain: number; // proceeds minus cost basis (can be negative = a loss)
  isLoss: boolean;
  taxableGain: number; // max(gain, 0)
  tax: number; // total estimated tax on the gain
  effectiveRatePct: number; // tax divided by taxable gain, as a percentage
  netProfit: number; // gain minus tax
  longTermSlices: CryptoTaxBracketSlice[]; // populated only for long-term gains
  schedule: CryptoTaxBracketSlice[]; // same data shaped for charting
}

// 2024 long-term capital gains breakpoints by filing status.
// [end of 0% band, end of 15% band]; above the second value the 20% rate applies.
const LT_BREAKS: Record<FilingStatus, [number, number]> = {
  single: [47025, 518900],
  married: [94050, 583750],
  head: [63000, 551350],
};

export function computeCryptoTax(input: CryptoTaxInput): CryptoTaxResult | null {
  const {
    proceeds,
    costBasis,
    heldLongTerm,
    taxableIncome,
    filingStatus,
    shortTermRatePct,
  } = input;

  if (!Number.isFinite(proceeds) || proceeds < 0) return null;
  if (!Number.isFinite(costBasis) || costBasis < 0) return null;
  if (!Number.isFinite(taxableIncome) || taxableIncome < 0) return null;
  if (!Number.isFinite(shortTermRatePct) || shortTermRatePct < 0) return null;

  const gain = proceeds - costBasis;
  const isLoss = gain < 0;
  const taxableGain = Math.max(gain, 0);

  let tax = 0;
  const longTermSlices: CryptoTaxBracketSlice[] = [];

  if (taxableGain > 0) {
    if (!heldLongTerm) {
      // Short-term: taxed at the ordinary marginal rate.
      const rate = shortTermRatePct / 100;
      tax = taxableGain * rate;
    } else {
      // Long-term: stack the gain on top of other taxable income, then walk the
      // 0% / 15% / 20% bands.
      const [zeroEnd, fifteenEnd] = LT_BREAKS[filingStatus];
      let lower = taxableIncome; // gains begin where income leaves off
      let remaining = taxableGain;

      const bands: { ratePct: number; top: number }[] = [
        { ratePct: 0, top: zeroEnd },
        { ratePct: 15, top: fifteenEnd },
        { ratePct: 20, top: Infinity },
      ];

      for (const band of bands) {
        if (remaining <= 0) break;
        const room = Math.max(band.top - lower, 0);
        if (room <= 0) continue;
        const amount = Math.min(remaining, room);
        const sliceTax = amount * (band.ratePct / 100);
        if (amount > 0) {
          longTermSlices.push({ ratePct: band.ratePct, amount, tax: sliceTax });
        }
        tax += sliceTax;
        remaining -= amount;
        lower += amount;
      }
    }
  }

  const effectiveRatePct = taxableGain > 0 ? (tax / taxableGain) * 100 : 0;
  const netProfit = gain - tax;

  // For short-term we still want a chartable single slice.
  const schedule: CryptoTaxBracketSlice[] =
    heldLongTerm && longTermSlices.length > 0
      ? longTermSlices
      : taxableGain > 0
        ? [{ ratePct: shortTermRatePct, amount: taxableGain, tax }]
        : [];

  return {
    gain,
    isLoss,
    taxableGain,
    tax,
    effectiveRatePct,
    netProfit,
    longTermSlices,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
