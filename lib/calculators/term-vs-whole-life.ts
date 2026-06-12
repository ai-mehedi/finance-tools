// Pure logic for the Term vs Whole Life Calculator.
// Compares the classic "buy term and invest the difference" strategy against a
// whole life policy. For each year it tracks the cumulative premiums paid into
// whole life, the cash value that policy builds at an assumed growth rate, and
// the side fund a buyer of cheaper term insurance could accumulate by investing
// the premium difference at a market return.

export interface TermVsWholeInput {
  coverAmount: number; // death benefit for both policies
  annualTermPremium: number; // cost of comparable term cover
  annualWholePremium: number; // cost of whole life cover
  wholeCashGrowthPct: number; // annual growth credited to whole life cash value
  investReturnPct: number; // expected return on the invested difference
  years: number; // comparison horizon
}

export interface TermVsWholeYearPoint {
  year: number;
  sideFund: number; // value of "buy term, invest the difference" fund
  cashValue: number; // whole life cash value
  termPaid: number; // cumulative term premiums paid
  wholePaid: number; // cumulative whole life premiums paid
}

export interface TermVsWholeResult {
  schedule: TermVsWholeYearPoint[];
  finalSideFund: number;
  finalCashValue: number;
  totalTermPaid: number;
  totalWholePaid: number;
  annualDifference: number; // whole premium minus term premium
  advantage: number; // sideFund minus cashValue at the horizon (positive favours term)
  betterStrategy: "term" | "whole";
  breakEvenYear: number | null; // first year cash value overtakes the side fund, if any
}

export function computeTermVsWhole(input: TermVsWholeInput): TermVsWholeResult | null {
  const {
    coverAmount,
    annualTermPremium,
    annualWholePremium,
    wholeCashGrowthPct,
    investReturnPct,
    years,
  } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualTermPremium) || annualTermPremium < 0) return null;
  if (!Number.isFinite(annualWholePremium) || annualWholePremium < 0) return null;
  if (annualWholePremium < annualTermPremium) {
    // Whole life should not be cheaper than comparable term; guard against bad input.
  }

  const n = Math.round(years);
  const annualDifference = annualWholePremium - annualTermPremium;
  const invR = investReturnPct / 100;
  const cashR = wholeCashGrowthPct / 100;

  // Whole life cash value typically lags in the early years because of front-loaded
  // costs; model that with a simple acquisition-cost drag in years one and two.
  let sideFund = 0;
  let cashValue = 0;
  let termPaid = 0;
  let wholePaid = 0;

  const schedule: TermVsWholeYearPoint[] = [
    { year: 0, sideFund: 0, cashValue: 0, termPaid: 0, wholePaid: 0 },
  ];

  let breakEvenYear: number | null = null;

  for (let y = 1; y <= n; y++) {
    // Side fund: grow last year's balance, then add this year's invested difference.
    sideFund = sideFund * (1 + invR) + Math.max(0, annualDifference);
    termPaid += annualTermPremium;
    wholePaid += annualWholePremium;

    // Whole life cash value: grow, then credit this year's premium net of a load.
    const load = y <= 1 ? 0.6 : y <= 2 ? 0.3 : 0.1; // share of premium lost to costs
    cashValue = cashValue * (1 + cashR) + annualWholePremium * (1 - load);

    schedule.push({ year: y, sideFund, cashValue, termPaid, wholePaid });

    if (breakEvenYear === null && cashValue > sideFund && sideFund > 0) {
      breakEvenYear = y;
    }
  }

  const advantage = sideFund - cashValue;

  return {
    schedule,
    finalSideFund: sideFund,
    finalCashValue: cashValue,
    totalTermPaid: termPaid,
    totalWholePaid: wholePaid,
    annualDifference,
    advantage,
    betterStrategy: advantage >= 0 ? "term" : "whole",
    breakEvenYear,
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
