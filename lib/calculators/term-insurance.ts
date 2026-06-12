// Pure logic for the Term Insurance Calculator.
// Estimates how much term life cover a household needs using the DIME-style
// approach (Debt, Income replacement, Mortgage, Education) minus assets already
// in place, and projects an indicative annual premium for that cover. It also
// builds a year-by-year view of the shrinking income-replacement need so the
// shortfall can be charted over the policy term.

export interface TermInsuranceInput {
  annualIncome: number;
  yearsToReplace: number; // how many years of income to cover
  mortgageBalance: number;
  otherDebts: number;
  educationFund: number; // future education / child costs
  finalExpenses: number; // funeral and immediate costs
  existingCover: number; // current life insurance already held
  liquidSavings: number; // savings/investments available to family
  age: number;
  termYears: number;
}

export interface TermYearPoint {
  year: number;
  needRemaining: number; // outstanding cover need at the start of that year
}

export interface TermInsuranceResult {
  incomeNeed: number;
  totalNeed: number; // gross cover required before offsets
  offsets: number; // existing cover + savings
  recommendedCover: number; // net cover to buy (>= 0)
  estimatedAnnualPremium: number;
  estimatedMonthlyPremium: number;
  schedule: TermYearPoint[];
}

// Indicative annual premium per 1,000 dollars of cover for a 20-year level term
// policy, by entry-age band (non-smoker, healthy). Rough market averages used
// only to give an order-of-magnitude estimate, not a quote.
function ratePer1000(age: number): number {
  if (age < 30) return 0.7;
  if (age < 35) return 0.85;
  if (age < 40) return 1.1;
  if (age < 45) return 1.7;
  if (age < 50) return 2.7;
  if (age < 55) return 4.4;
  if (age < 60) return 7.2;
  return 12.0;
}

// Longer terms cost more per unit of cover; scale relative to a 20-year baseline.
function termFactor(termYears: number): number {
  if (termYears <= 10) return 0.7;
  if (termYears <= 15) return 0.85;
  if (termYears <= 20) return 1.0;
  if (termYears <= 30) return 1.35;
  return 1.6;
}

export function computeTermInsurance(input: TermInsuranceInput): TermInsuranceResult | null {
  const {
    annualIncome,
    yearsToReplace,
    mortgageBalance,
    otherDebts,
    educationFund,
    finalExpenses,
    existingCover,
    liquidSavings,
    age,
    termYears,
  } = input;

  if (!Number.isFinite(annualIncome) || annualIncome < 0) return null;
  if (!Number.isFinite(yearsToReplace) || yearsToReplace < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(age) || age <= 0 || age > 80) return null;

  const incomeNeed = annualIncome * yearsToReplace;
  const totalNeed =
    incomeNeed +
    Math.max(0, mortgageBalance || 0) +
    Math.max(0, otherDebts || 0) +
    Math.max(0, educationFund || 0) +
    Math.max(0, finalExpenses || 0);

  const offsets = Math.max(0, existingCover || 0) + Math.max(0, liquidSavings || 0);
  const recommendedCover = Math.max(0, totalNeed - offsets);

  const annualRate = (recommendedCover / 1000) * ratePer1000(age) * termFactor(termYears);
  const estimatedAnnualPremium = recommendedCover > 0 ? annualRate : 0;
  const estimatedMonthlyPremium = estimatedAnnualPremium / 12;

  // The income-replacement portion of the need falls by one year each year; the
  // lump-sum portions (debts, mortgage, education, final expenses) are treated as
  // constant for this simplified projection.
  const lumpNeed = totalNeed - incomeNeed;
  const schedule: TermYearPoint[] = [];
  const span = Math.min(Math.round(termYears), Math.max(1, Math.round(yearsToReplace) || Math.round(termYears)));
  const horizon = Math.round(termYears);
  for (let y = 0; y <= horizon; y++) {
    const remainingYears = Math.max(0, yearsToReplace - y);
    const incomePart = annualIncome * remainingYears;
    const gross = incomePart + Math.max(0, lumpNeed);
    schedule.push({ year: y, needRemaining: Math.max(0, gross - offsets) });
  }
  void span;

  return {
    incomeNeed,
    totalNeed,
    offsets,
    recommendedCover,
    estimatedAnnualPremium,
    estimatedMonthlyPremium,
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
