// Pure logic for the Capital Gains Tax Calculator.
// Estimates US federal capital gains tax on the sale of an asset. Distinguishes
// short-term gains (held one year or less, taxed as ordinary income) from
// long-term gains (held more than a year, taxed at preferential 0/15/20% rates),
// and adds the 3.8% Net Investment Income Tax (NIIT) above income thresholds.
// Brackets are 2024 figures and are estimates only.

export type HoldingTerm = "short" | "long";
export type FilingStatus = "single" | "married" | "head";

export interface CapitalGainsInput {
  purchasePrice: number; // cost basis
  salePrice: number; // proceeds
  otherIncome: number; // ordinary taxable income before the gain
  term: HoldingTerm;
  filing: FilingStatus;
}

// Long-term capital gains rate breakpoints (2024 taxable income).
const LTCG_BREAKS: Record<FilingStatus, { zero: number; fifteen: number }> = {
  single: { zero: 47025, fifteen: 518900 },
  married: { zero: 94050, fifteen: 583750 },
  head: { zero: 63000, fifteen: 551350 },
};

// Simplified ordinary income brackets (2024) used to approximate short-term tax.
const ORDINARY_BRACKETS: Record<FilingStatus, { upTo: number; rate: number }[]> = {
  single: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  married: [
    { upTo: 23200, rate: 0.1 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  head: [
    { upTo: 16550, rate: 0.1 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

// 3.8% Net Investment Income Tax thresholds (modified AGI).
const NIIT_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  married: 250000,
  head: 200000,
};

export interface CapitalGainsResult {
  gain: number; // sale minus purchase (can be negative => loss)
  isLoss: boolean;
  capitalGainsTax: number; // tax attributable to the gain (LTCG or short-term marginal)
  niit: number;
  totalTax: number;
  effectiveRate: number; // totalTax / gain as a fraction
  netProceeds: number; // salePrice minus totalTax
  // For charting: how the gain splits across the relevant rate tiers.
  tiers: { label: string; amount: number; rate: number; tax: number }[];
}

function ordinaryTax(income: number, filing: FilingStatus): number {
  if (income <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const b of ORDINARY_BRACKETS[filing]) {
    if (income > prev) {
      const slice = Math.min(income, b.upTo) - prev;
      tax += slice * b.rate;
      prev = b.upTo;
    } else break;
  }
  return tax;
}

export function computeCapitalGains(input: CapitalGainsInput): CapitalGainsResult | null {
  const { purchasePrice, salePrice, otherIncome, term, filing } = input;

  if (![purchasePrice, salePrice, otherIncome].every((v) => Number.isFinite(v))) return null;
  if (purchasePrice < 0 || salePrice < 0 || otherIncome < 0) return null;

  const gain = salePrice - purchasePrice;

  if (gain <= 0) {
    return {
      gain,
      isLoss: true,
      capitalGainsTax: 0,
      niit: 0,
      totalTax: 0,
      effectiveRate: 0,
      netProceeds: salePrice,
      tiers: [],
    };
  }

  const base = Math.max(0, otherIncome);
  let capitalGainsTax = 0;
  const tiers: { label: string; amount: number; rate: number; tax: number }[] = [];

  if (term === "short") {
    // Short-term gains stack on top of ordinary income at marginal rates.
    capitalGainsTax = ordinaryTax(base + gain, filing) - ordinaryTax(base, filing);
    const rate = gain > 0 ? capitalGainsTax / gain : 0;
    tiers.push({ label: "Short-term (ordinary)", amount: gain, rate, tax: capitalGainsTax });
  } else {
    const br = LTCG_BREAKS[filing];
    let remaining = gain;
    let stackTop = base; // taxable income already used before applying gain

    // 0% tier
    const zeroRoom = Math.max(0, br.zero - stackTop);
    const zeroAmt = Math.min(remaining, zeroRoom);
    if (zeroAmt > 0) {
      tiers.push({ label: "0% rate", amount: zeroAmt, rate: 0, tax: 0 });
      remaining -= zeroAmt;
      stackTop += zeroAmt;
    }
    // 15% tier
    const fifteenRoom = Math.max(0, br.fifteen - stackTop);
    const fifteenAmt = Math.min(remaining, fifteenRoom);
    if (fifteenAmt > 0) {
      const tax = fifteenAmt * 0.15;
      tiers.push({ label: "15% rate", amount: fifteenAmt, rate: 0.15, tax });
      capitalGainsTax += tax;
      remaining -= fifteenAmt;
      stackTop += fifteenAmt;
    }
    // 20% tier
    if (remaining > 0) {
      const tax = remaining * 0.2;
      tiers.push({ label: "20% rate", amount: remaining, rate: 0.2, tax });
      capitalGainsTax += tax;
      remaining = 0;
    }
  }

  // Net Investment Income Tax: 3.8% on the lesser of net investment income (the gain)
  // and the amount of modified AGI over the threshold.
  const magi = base + gain;
  const thr = NIIT_THRESHOLD[filing];
  const overThreshold = Math.max(0, magi - thr);
  const niit = 0.038 * Math.min(gain, overThreshold);

  const totalTax = capitalGainsTax + niit;
  const effectiveRate = gain > 0 ? totalTax / gain : 0;
  const netProceeds = salePrice - totalTax;

  return {
    gain,
    isLoss: false,
    capitalGainsTax,
    niit,
    totalTax,
    effectiveRate,
    netProceeds,
    tiers,
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
