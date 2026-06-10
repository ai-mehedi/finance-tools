// Pure logic for the Roth IRA Calculator.
// Projects the balance of a Roth IRA from a starting balance plus annual
// contributions growing at an assumed return until retirement. Because Roth
// contributions are made with after-tax dollars, qualified withdrawals are
// tax free, so the ending balance is also the after-tax (spendable) amount.
// A taxable-account comparison shows the tax drag a Roth avoids.

export interface RothIraInput {
  currentBalance: number;
  annualContribution: number;
  annualRatePct: number;
  currentAge: number;
  retirementAge: number;
  taxRatePct: number; // marginal rate used for the taxable comparison
}

export interface RothIraYearPoint {
  age: number;
  roth: number; // tax-free Roth balance
  taxable: number; // comparable taxable account after annual tax on gains
  contributed: number; // cumulative out-of-pocket contributions plus start
}

export interface RothIraResult {
  endingBalance: number; // tax-free Roth value at retirement
  totalContributions: number; // excludes the starting balance
  totalGrowth: number;
  taxableEnding: number; // a taxable account holding the same contributions
  taxAdvantage: number; // endingBalance minus taxableEnding
  years: number;
  schedule: RothIraYearPoint[];
}

export function computeRothIra(input: RothIraInput): RothIraResult | null {
  const {
    currentBalance,
    annualContribution,
    annualRatePct,
    currentAge,
    retirementAge,
    taxRatePct,
  } = input;

  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAge) return null;
  if (currentBalance < 0 || annualContribution < 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;

  const years = Math.round(retirementAge - currentAge);
  const r = annualRatePct / 100;
  const tax = Math.max(0, taxRatePct) / 100;
  // After-tax growth rate for the taxable comparison: gains are taxed each year.
  const taxableRate = r * (1 - tax);

  let roth = currentBalance;
  let taxable = currentBalance;

  const schedule: RothIraYearPoint[] = [
    { age: currentAge, roth, taxable, contributed: currentBalance },
  ];

  for (let i = 1; i <= years; i++) {
    // Contribution made at the start of the year, then grows for the year.
    roth = (roth + annualContribution) * (1 + r);
    taxable = (taxable + annualContribution) * (1 + taxableRate);
    const contributed = currentBalance + annualContribution * i;
    schedule.push({
      age: currentAge + i,
      roth,
      taxable,
      contributed,
    });
  }

  const totalContributions = annualContribution * years;
  const endingBalance = roth;
  const totalGrowth = endingBalance - currentBalance - totalContributions;
  const taxableEnding = taxable;
  const taxAdvantage = endingBalance - taxableEnding;

  return {
    endingBalance,
    totalContributions,
    totalGrowth,
    taxableEnding,
    taxAdvantage,
    years,
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
