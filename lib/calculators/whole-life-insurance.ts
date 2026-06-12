// Pure logic for the Whole Life Insurance Calculator.
// Whole life insurance pairs a fixed death benefit with a cash value account that
// grows on a tax-deferred basis. This model estimates the level annual premium
// needed to fund a chosen death benefit and projects the guaranteed cash value
// year by year, assuming a steady credited rate on the policy's cash account.

export interface WholeLifeInput {
  deathBenefit: number; // face amount paid to beneficiaries
  currentAge: number; // insured's age today
  annualPremium: number; // premium paid each year (0 = solve for it)
  creditedRatePct: number; // annual growth rate credited to cash value
  premiumLoadPct: number; // share of each premium that funds policy costs
  years: number; // projection horizon in years
}

export interface WholeLifeYearPoint {
  year: number;
  age: number;
  premiumsPaid: number; // cumulative premiums paid in
  cashValue: number; // guaranteed cash value at year end
  deathBenefit: number; // level death benefit
}

export interface WholeLifeResult {
  annualPremium: number;
  totalPremiums: number; // premiums paid over the horizon
  endingCashValue: number;
  totalGrowth: number; // ending cash value minus premiums that funded it
  breakEvenYear: number | null; // first year cash value exceeds premiums paid
  deathBenefit: number;
  schedule: WholeLifeYearPoint[];
}

// A simple level-premium estimate: premium scales with face amount and the
// insured's age, since older lives cost more to insure per dollar of coverage.
function estimatePremium(deathBenefit: number, currentAge: number): number {
  const perThousand = 8 + Math.max(0, currentAge - 25) * 0.55;
  return (deathBenefit / 1000) * perThousand;
}

export function computeWholeLife(input: WholeLifeInput): WholeLifeResult | null {
  const { deathBenefit, currentAge, annualPremium, creditedRatePct, premiumLoadPct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(deathBenefit) || deathBenefit <= 0) return null;
  if (!Number.isFinite(currentAge) || currentAge < 0 || currentAge > 100) return null;
  if (annualPremium < 0 || creditedRatePct < 0) return null;
  if (premiumLoadPct < 0 || premiumLoadPct > 95) return null;

  const premium =
    annualPremium && annualPremium > 0 ? annualPremium : estimatePremium(deathBenefit, currentAge);

  const rate = creditedRatePct / 100;
  const load = premiumLoadPct / 100;
  const fundingPerYear = premium * (1 - load); // amount that lands in cash value

  let cashValue = 0;
  let premiumsPaid = 0;
  let breakEvenYear: number | null = null;

  const schedule: WholeLifeYearPoint[] = [
    { year: 0, age: currentAge, premiumsPaid: 0, cashValue: 0, deathBenefit },
  ];

  const horizon = Math.round(years);
  for (let y = 1; y <= horizon; y++) {
    // Premium credited at the start of the year, then grows for the year.
    cashValue = (cashValue + fundingPerYear) * (1 + rate);
    premiumsPaid += premium;

    if (breakEvenYear === null && cashValue >= premiumsPaid) breakEvenYear = y;

    schedule.push({
      year: y,
      age: currentAge + y,
      premiumsPaid,
      cashValue,
      deathBenefit,
    });
  }

  const totalPremiums = premium * horizon;
  const endingCashValue = cashValue;
  const totalGrowth = endingCashValue - premiumsPaid * (1 - load);

  return {
    annualPremium: premium,
    totalPremiums,
    endingCashValue,
    totalGrowth,
    breakEvenYear,
    deathBenefit,
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
