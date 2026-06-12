// Pure logic for the Subscription Cost Calculator.
// Normalizes a recurring subscription price (charged weekly, monthly, quarterly or
// yearly) into a true monthly and annual cost, then projects the cumulative spend
// over a chosen number of years. Optionally models an annual price increase so you
// can see how a "cheap" subscription compounds. Also reports the opportunity cost:
// what that same money could grow to if invested instead, at a given return.

export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";

export const PERIODS_PER_YEAR: Record<BillingCycle, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

export const CYCLE_LABEL: Record<BillingCycle, string> = {
  weekly: "per week",
  monthly: "per month",
  quarterly: "per quarter",
  yearly: "per year",
};

export interface SubscriptionInput {
  price: number; // price charged each billing cycle
  cycle: BillingCycle;
  quantity: number; // number of identical subscriptions / seats
  years: number; // projection horizon
  annualIncreasePct: number; // expected yearly price hike
  investReturnPct: number; // return if the money were invested instead
}

export interface SubscriptionYearPoint {
  year: number;
  cumulativeSpend: number; // total paid by the end of this year
  investedValue: number; // what that spend could have grown to instead
}

export interface SubscriptionResult {
  monthlyCost: number; // first-year normalized monthly cost
  yearlyCost: number; // first-year normalized annual cost
  weeklyCost: number;
  dailyCost: number;
  totalSpend: number; // total over the whole horizon (with increases)
  investedValue: number; // total opportunity cost at horizon
  foregoneGrowth: number; // investedValue minus totalSpend
  schedule: SubscriptionYearPoint[];
}

export function computeSubscriptionCost(input: SubscriptionInput): SubscriptionResult | null {
  const { price, cycle, quantity, years, annualIncreasePct, investReturnPct } = input;

  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualIncreasePct)) return null;
  if (!Number.isFinite(investReturnPct)) return null;

  const perYear = PERIODS_PER_YEAR[cycle];
  const baseYearly = price * perYear * quantity; // first-year cost
  const monthlyCost = baseYearly / 12;
  const weeklyCost = baseYearly / 52;
  const dailyCost = baseYearly / 365;

  const inc = annualIncreasePct / 100;
  const monthlyReturn = Math.pow(1 + investReturnPct / 100, 1 / 12) - 1;
  const wholeYears = Math.max(1, Math.round(years));

  let cumulativeSpend = 0;
  let invested = 0;
  const schedule: SubscriptionYearPoint[] = [{ year: 0, cumulativeSpend: 0, investedValue: 0 }];

  for (let y = 0; y < wholeYears; y++) {
    const yearlyThisYear = baseYearly * Math.pow(1 + inc, y);
    const monthlyThisYear = yearlyThisYear / 12;
    // Add the monthly cost each month and grow the invested pot alongside it.
    for (let m = 0; m < 12; m++) {
      invested = invested * (1 + monthlyReturn) + monthlyThisYear;
      cumulativeSpend += monthlyThisYear;
    }
    schedule.push({ year: y + 1, cumulativeSpend, investedValue: invested });
  }

  return {
    monthlyCost,
    yearlyCost: baseYearly,
    weeklyCost,
    dailyCost,
    totalSpend: cumulativeSpend,
    investedValue: invested,
    foregoneGrowth: invested - cumulativeSpend,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
