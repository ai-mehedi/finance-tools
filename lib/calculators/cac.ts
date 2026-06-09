// Pure logic for the Customer Acquisition Cost (CAC) Calculator.
// CAC = total sales and marketing spend divided by new customers acquired.
// We also surface the LTV to CAC ratio and payback period when the optional
// lifetime value inputs are provided.

export interface CacInput {
  marketingSpend: number;
  salesSpend: number;
  newCustomers: number;
  avgRevenuePerCustomer: number; // monthly revenue per customer, optional (0 to skip)
  grossMarginPct: number; // gross margin on that revenue
}

export interface CacResult {
  totalSpend: number;
  cac: number;
  ltv: number; // simple lifetime value estimate, 0 if not enough inputs
  ltvToCac: number; // ratio, 0 if cac is 0 or ltv is 0
  paybackMonths: number; // months to recover CAC from gross margin, 0 if not applicable
}

export function computeCac(input: CacInput): CacResult | null {
  const { marketingSpend, salesSpend, newCustomers, avgRevenuePerCustomer, grossMarginPct } = input;

  if (!Number.isFinite(newCustomers) || newCustomers <= 0) return null;
  if (marketingSpend < 0 || salesSpend < 0) return null;
  if (avgRevenuePerCustomer < 0 || grossMarginPct < 0) return null;

  const totalSpend = marketingSpend + salesSpend;
  const cac = totalSpend / newCustomers;

  const margin = grossMarginPct / 100;
  const monthlyGrossProfit = avgRevenuePerCustomer * margin;

  // A simple 24 month lifetime value estimate from monthly gross profit.
  const ltv = monthlyGrossProfit > 0 ? monthlyGrossProfit * 24 : 0;
  const ltvToCac = ltv > 0 && cac > 0 ? ltv / cac : 0;
  const paybackMonths = monthlyGrossProfit > 0 ? cac / monthlyGrossProfit : 0;

  return { totalSpend, cac, ltv, ltvToCac, paybackMonths };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
