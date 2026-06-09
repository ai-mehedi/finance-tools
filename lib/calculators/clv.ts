// Pure logic for the Customer Lifetime Value (CLV) Calculator.
// CLV estimates the total gross profit a business expects from an average
// customer over the whole relationship. A common formula is:
//   Average order value x purchase frequency per year = annual revenue
//   Annual revenue x gross margin = annual gross profit
//   Annual gross profit x average customer lifespan (years) = CLV
// Subtracting the customer acquisition cost (CAC) gives net CLV.

export interface ClvInput {
  avgOrderValue: number; // average order value in dollars
  purchasesPerYear: number; // average number of purchases per year
  grossMarginPct: number; // gross margin as a percent (0 to 100)
  lifespanYears: number; // average customer lifespan in years
  acquisitionCost: number; // cost to acquire one customer
}

export interface ClvResult {
  annualRevenue: number; // revenue from one customer per year
  annualProfit: number; // gross profit from one customer per year
  grossClv: number; // lifetime gross profit before acquisition cost
  netClv: number; // grossClv minus acquisition cost
  clvToCacRatio: number; // grossClv / acquisitionCost (0 if no CAC)
  totalPurchases: number; // expected purchases over the lifespan
}

export function computeClv(input: ClvInput): ClvResult | null {
  const { avgOrderValue, purchasesPerYear, grossMarginPct, lifespanYears, acquisitionCost } = input;

  if (!Number.isFinite(avgOrderValue) || avgOrderValue < 0) return null;
  if (!Number.isFinite(purchasesPerYear) || purchasesPerYear < 0) return null;
  if (!Number.isFinite(grossMarginPct) || grossMarginPct < 0) return null;
  if (!Number.isFinite(lifespanYears) || lifespanYears <= 0) return null;
  if (!Number.isFinite(acquisitionCost) || acquisitionCost < 0) return null;

  const margin = grossMarginPct / 100;
  const annualRevenue = avgOrderValue * purchasesPerYear;
  const annualProfit = annualRevenue * margin;
  const grossClv = annualProfit * lifespanYears;
  const netClv = grossClv - acquisitionCost;
  const clvToCacRatio = acquisitionCost > 0 ? grossClv / acquisitionCost : 0;
  const totalPurchases = purchasesPerYear * lifespanYears;

  return { annualRevenue, annualProfit, grossClv, netClv, clvToCacRatio, totalPurchases };
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
