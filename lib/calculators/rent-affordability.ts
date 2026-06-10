// Pure logic for the Rent Affordability Calculator.
// Estimates how much monthly rent a household can comfortably afford based on
// gross monthly income, existing monthly debt payments and a target share of
// income spent on housing. Uses the common 30% rule of thumb plus a debt
// burden check so the recommendation stays realistic.

export interface RentAffordabilityInput {
  monthlyIncome: number; // gross, before tax
  monthlyDebt: number; // car loans, student loans, credit cards, etc.
  rentPercent: number; // target share of gross income for rent, e.g. 30
}

export interface RentBand {
  label: string;
  percent: number;
  rent: number;
}

export interface RentAffordabilityResult {
  recommendedRent: number; // at the chosen target percent, after debt check
  rawTargetRent: number; // chosen percent of income, before debt adjustment
  debtAdjusted: boolean; // true when debt pulled the figure below the target
  remainingAfterRent: number; // income left after rent and debt
  rentToIncomePct: number; // recommendedRent divided by income, in percent
  bands: RentBand[]; // conservative / moderate / stretch for the chart
}

// A frequently used guideline caps total debt plus housing at about 43% of
// gross income. We keep rent under that ceiling once existing debt is counted.
const TOTAL_DEBT_CEILING = 0.43;

export function computeRentAffordability(
  input: RentAffordabilityInput,
): RentAffordabilityResult | null {
  const { monthlyIncome, monthlyDebt, rentPercent } = input;

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return null;
  if (monthlyDebt < 0) return null;
  if (!Number.isFinite(rentPercent) || rentPercent <= 0 || rentPercent > 100) return null;

  const rawTargetRent = monthlyIncome * (rentPercent / 100);

  // Rent must also keep total obligations under the debt ceiling.
  const debtCeilingRent = Math.max(0, monthlyIncome * TOTAL_DEBT_CEILING - monthlyDebt);
  const recommendedRent = Math.min(rawTargetRent, debtCeilingRent);
  const debtAdjusted = debtCeilingRent < rawTargetRent;

  const remainingAfterRent = monthlyIncome - recommendedRent - monthlyDebt;
  const rentToIncomePct = (recommendedRent / monthlyIncome) * 100;

  const bandDefs: { label: string; percent: number }[] = [
    { label: "Conservative", percent: 25 },
    { label: "Moderate", percent: 30 },
    { label: "Stretch", percent: 35 },
  ];
  const bands: RentBand[] = bandDefs.map((b) => ({
    label: b.label,
    percent: b.percent,
    rent: monthlyIncome * (b.percent / 100),
  }));

  return {
    recommendedRent,
    rawTargetRent,
    debtAdjusted,
    remainingAfterRent,
    rentToIncomePct,
    bands,
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
