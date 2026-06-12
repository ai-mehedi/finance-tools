// Pure logic for the Traditional IRA Calculator.
// Grows a starting balance plus annual contributions inside a Traditional IRA,
// where investment gains compound tax-deferred until withdrawal. At retirement
// the full balance is taxable, so we also estimate the after-tax value using a
// retirement tax rate, and we credit the up-front tax deduction on each
// deductible contribution. A per-year schedule is returned for charting.

export interface TraditionalIraInput {
  currentBalance: number; // money already in the IRA today
  annualContribution: number; // contributed each year going forward
  currentAge: number;
  retirementAge: number;
  annualReturnPct: number; // expected pre-tax annual return, percent
  currentTaxRatePct: number; // marginal rate today, for the deduction value
  retirementTaxRatePct: number; // expected rate when withdrawing
}

export interface TraditionalIraYearPoint {
  age: number;
  balance: number; // pre-tax IRA balance
  contributed: number; // cumulative contributions plus starting balance
  afterTax: number; // balance net of retirement tax
}

export interface TraditionalIraResult {
  years: number;
  preTaxBalance: number; // gross IRA value at retirement
  afterTaxBalance: number; // value after paying retirement-rate tax on the whole balance
  totalContributions: number; // contributions made (excludes starting balance)
  totalGrowth: number; // investment earnings
  taxDeferredOnGrowth: number; // tax that would have been due on growth in a taxable account (rough)
  upfrontTaxSavings: number; // deduction value of contributions at today's rate
  schedule: TraditionalIraYearPoint[];
}

export function computeTraditionalIra(input: TraditionalIraInput): TraditionalIraResult | null {
  const {
    currentBalance,
    annualContribution,
    currentAge,
    retirementAge,
    annualReturnPct,
    currentTaxRatePct,
    retirementTaxRatePct,
  } = input;

  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAge) return null;
  if (currentBalance < 0 || annualContribution < 0) return null;
  if (!Number.isFinite(annualReturnPct)) return null;

  const years = Math.round(retirementAge - currentAge);
  const r = annualReturnPct / 100;
  const retTax = Math.min(Math.max(retirementTaxRatePct / 100, 0), 1);
  const curTax = Math.min(Math.max(currentTaxRatePct / 100, 0), 1);

  let balance = currentBalance;
  const schedule: TraditionalIraYearPoint[] = [
    {
      age: currentAge,
      balance,
      contributed: currentBalance,
      afterTax: balance * (1 - retTax),
    },
  ];

  for (let y = 1; y <= years; y++) {
    // Contribution made at the start of the year, then a full year of growth.
    balance = (balance + annualContribution) * (1 + r);
    const contributed = currentBalance + annualContribution * y;
    schedule.push({
      age: currentAge + y,
      balance,
      contributed,
      afterTax: balance * (1 - retTax),
    });
  }

  const totalContributions = annualContribution * years;
  const preTaxBalance = balance;
  const totalGrowth = preTaxBalance - currentBalance - totalContributions;
  const afterTaxBalance = preTaxBalance * (1 - retTax);
  const taxDeferredOnGrowth = totalGrowth * retTax;
  const upfrontTaxSavings = totalContributions * curTax;

  return {
    years,
    preTaxBalance,
    afterTaxBalance,
    totalContributions,
    totalGrowth,
    taxDeferredOnGrowth,
    upfrontTaxSavings,
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
