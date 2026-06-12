// Pure logic for the Roth IRA Calculator.
// Projects the balance of a Roth IRA from a starting balance plus annual
// contributions growing at an assumed return until retirement. Because Roth
// contributions are made with after-tax dollars, qualified withdrawals are
// completely tax free — so the projected balance equals the spendable amount.
// For comparison we also estimate what an equivalent taxable account would be
// worth after paying tax on the gains, to show the Roth tax advantage.
//
// Contributions are capped at the annual IRA limit (with a catch-up amount for
// savers age 50 and older), and they stop at the chosen retirement age.

// 2024 IRA contribution limits.
export const IRA_LIMIT = 7000;
export const IRA_CATCHUP_LIMIT = 8000; // age 50+

export interface RothIraInput {
  currentAge: number;
  retirementAge: number;
  startingBalance: number;
  annualContribution: number;
  annualReturnPct: number;
  taxRatePct: number; // marginal rate, used for the taxable comparison
}

export interface RothIraYearPoint {
  age: number;
  rothBalance: number;
  contributed: number; // cumulative contributions plus starting balance
  taxableBalance: number; // after-tax value of an equivalent taxable account
}

export interface RothIraResult {
  appliedContribution: number; // contribution after applying the IRS cap
  capApplied: boolean;
  rothBalance: number; // tax-free at retirement
  totalContributed: number; // out-of-pocket including starting balance
  totalGrowth: number; // tax-free earnings
  taxableBalance: number; // comparable taxable account, after tax on gains
  taxesSaved: number; // Roth advantage vs the taxable account
  schedule: RothIraYearPoint[];
}

export function computeRothIra(input: RothIraInput): RothIraResult | null {
  const {
    currentAge,
    retirementAge,
    startingBalance,
    annualContribution,
    annualReturnPct,
    taxRatePct,
  } = input;

  if (!Number.isFinite(currentAge) || currentAge < 0) return null;
  if (!Number.isFinite(retirementAge) || retirementAge <= currentAge) return null;
  if (startingBalance < 0 || annualContribution < 0) return null;
  if (!Number.isFinite(annualReturnPct)) return null;
  if (!Number.isFinite(taxRatePct) || taxRatePct < 0 || taxRatePct > 100) return null;

  const years = Math.round(retirementAge - currentAge);
  const r = annualReturnPct / 100;
  const taxRate = taxRatePct / 100;

  // Apply the IRS annual contribution cap (catch-up kicks in at age 50).
  const limit = currentAge >= 50 ? IRA_CATCHUP_LIMIT : IRA_LIMIT;
  const appliedContribution = Math.min(annualContribution, limit);
  const capApplied = annualContribution > limit;

  let rothBalance = startingBalance;
  // Taxable comparison: same contributions, but gains are taxed each year, so
  // it compounds at an after-tax rate. Starting balance assumed already taxed.
  const afterTaxR = r * (1 - taxRate);
  let taxableBalance = startingBalance;
  let contributedCum = startingBalance;

  const schedule: RothIraYearPoint[] = [
    {
      age: Math.round(currentAge),
      rothBalance,
      contributed: contributedCum,
      taxableBalance,
    },
  ];

  for (let y = 1; y <= years; y++) {
    // Contribution at the start of the year, then a full year of growth.
    const ageThisYear = currentAge + y - 1;
    const limitThisYear = ageThisYear >= 50 ? IRA_CATCHUP_LIMIT : IRA_LIMIT;
    const contribThisYear = Math.min(annualContribution, limitThisYear);

    rothBalance = (rothBalance + contribThisYear) * (1 + r);
    taxableBalance = (taxableBalance + contribThisYear) * (1 + afterTaxR);
    contributedCum += contribThisYear;

    schedule.push({
      age: Math.round(currentAge + y),
      rothBalance,
      contributed: contributedCum,
      taxableBalance,
    });
  }

  const totalContributed = contributedCum;
  const totalGrowth = rothBalance - totalContributed;
  const taxesSaved = rothBalance - taxableBalance;

  return {
    appliedContribution,
    capApplied,
    rothBalance,
    totalContributed,
    totalGrowth,
    taxableBalance,
    taxesSaved,
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
