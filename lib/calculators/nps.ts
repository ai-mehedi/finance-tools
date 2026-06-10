// Pure logic for the NPS (National Pension System) Calculator.
// Models monthly contributions growing at an expected annual return until
// retirement age. At maturity a chosen fraction of the corpus is used to buy
// an annuity (the rest is a tax-free lump sum), and a flat annuity rate gives
// the indicative monthly pension. Amounts are in INR.

export interface NpsInput {
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number; // contributions run until this age (max 70 in NPS)
  expectedReturnPct: number; // expected annual return on the corpus
  annuityPortionPct: number; // share of corpus used to buy an annuity (min 40%)
  annuityRatePct: number; // expected annual return on the annuity
}

export interface NpsYearPoint {
  age: number;
  corpus: number;
  invested: number;
}

export interface NpsResult {
  totalCorpus: number;
  totalInvested: number;
  totalGain: number;
  lumpSum: number; // withdrawable at retirement (tax-free portion)
  annuityValue: number; // amount locked into the annuity
  monthlyPension: number; // indicative monthly pension from the annuity
  schedule: NpsYearPoint[];
}

export function computeNps(input: NpsInput): NpsResult | null {
  const {
    monthlyContribution,
    currentAge,
    retirementAge,
    expectedReturnPct,
    annuityPortionPct,
    annuityRatePct,
  } = input;

  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAge) return null;
  if (monthlyContribution < 0) return null;
  if (!Number.isFinite(expectedReturnPct) || expectedReturnPct < 0) return null;
  if (annuityPortionPct < 0 || annuityPortionPct > 100) return null;
  if (annuityRatePct < 0) return null;

  const years = retirementAge - currentAge;
  const months = Math.round(years * 12);
  const monthlyRate = expectedReturnPct / 100 / 12;

  let corpus = 0;
  const schedule: NpsYearPoint[] = [{ age: currentAge, corpus: 0, invested: 0 }];

  for (let m = 1; m <= months; m++) {
    corpus = (corpus + monthlyContribution) * (1 + monthlyRate);
    if (m % 12 === 0) {
      schedule.push({
        age: currentAge + m / 12,
        corpus,
        invested: monthlyContribution * m,
      });
    }
  }

  const totalCorpus = corpus;
  const totalInvested = monthlyContribution * months;
  const totalGain = totalCorpus - totalInvested;

  const annuityFraction = annuityPortionPct / 100;
  const annuityValue = totalCorpus * annuityFraction;
  const lumpSum = totalCorpus - annuityValue;
  const monthlyPension = (annuityValue * (annuityRatePct / 100)) / 12;

  return {
    totalCorpus,
    totalInvested,
    totalGain,
    lumpSum,
    annuityValue,
    monthlyPension,
    schedule,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  // Indian convention: crore (10^7) and lakh (10^5).
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
