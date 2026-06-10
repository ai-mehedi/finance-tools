// Pure logic for the Human Life Value (HLV) Calculator.
// Estimates the economic value of a person's future earnings to their family,
// net of self-maintenance, discounted to today's dollars. This is the
// income-replacement approach commonly used to size a life insurance need.
//
// We project the breadwinner's after-tax income that supports the family
// (income minus personal expenses), grow it each year by an expected income
// growth rate, then discount every future year back to a present value using
// a real discount rate. Existing savings and existing cover are subtracted to
// reach the additional cover gap.

export interface HumanLifeValueInput {
  currentAge: number;
  retirementAge: number;
  annualIncome: number; // current gross/after-tax annual income
  personalExpensePct: number; // % of income spent only on the earner (excluded)
  incomeGrowthPct: number; // expected annual income growth
  discountRatePct: number; // assumed return / discount rate
  existingSavings: number; // liquid savings already set aside for the family
  existingCover: number; // life cover already in force
}

export interface HumanLifeValueYearPoint {
  year: number; // years from now
  age: number;
  contribution: number; // family-supporting income that year (future dollars)
  presentValue: number; // discounted value of that year's contribution
  cumulativePV: number; // running present value of income replaced
}

export interface HumanLifeValueResult {
  humanLifeValue: number; // present value of all future family income
  recommendedCover: number; // HLV minus existing savings and cover (floored at 0)
  yearsOfIncome: number; // working years remaining
  totalFutureIncome: number; // undiscounted sum of family-supporting income
  schedule: HumanLifeValueYearPoint[];
}

export function computeHumanLifeValue(
  input: HumanLifeValueInput
): HumanLifeValueResult | null {
  const {
    currentAge,
    retirementAge,
    annualIncome,
    personalExpensePct,
    incomeGrowthPct,
    discountRatePct,
    existingSavings,
    existingCover,
  } = input;

  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAge) return null;
  if (annualIncome <= 0) return null;
  if (personalExpensePct < 0 || personalExpensePct >= 100) return null;
  if (existingSavings < 0 || existingCover < 0) return null;

  const years = Math.round(retirementAge - currentAge);
  const g = incomeGrowthPct / 100;
  const d = discountRatePct / 100;
  const supportShare = 1 - personalExpensePct / 100;

  let cumulativePV = 0;
  let totalFutureIncome = 0;
  const schedule: HumanLifeValueYearPoint[] = [
    { year: 0, age: currentAge, contribution: 0, presentValue: 0, cumulativePV: 0 },
  ];

  for (let t = 1; t <= years; t++) {
    // Income earned in year t (grown from today), then the family-supporting slice.
    const grownIncome = annualIncome * Math.pow(1 + g, t - 1);
    const contribution = grownIncome * supportShare;
    const pv = contribution / Math.pow(1 + d, t);

    totalFutureIncome += contribution;
    cumulativePV += pv;

    schedule.push({
      year: t,
      age: currentAge + t,
      contribution,
      presentValue: pv,
      cumulativePV,
    });
  }

  const humanLifeValue = cumulativePV;
  const recommendedCover = Math.max(
    0,
    humanLifeValue - existingSavings - existingCover
  );

  return {
    humanLifeValue,
    recommendedCover,
    yearsOfIncome: years,
    totalFutureIncome,
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
