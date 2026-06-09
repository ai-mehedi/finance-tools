// Pure logic for the Credit Limit Increase Calculator.
// Shows how a higher credit limit changes your credit utilization ratio, which
// is one of the biggest drivers of a credit score. Utilization = balance / limit.

export interface CreditLimitInput {
  currentLimit: number;
  currentBalance: number;
  increaseAmount: number; // dollars added to the limit
}

export interface CreditLimitResult {
  newLimit: number;
  currentUtilizationPct: number; // balance / current limit * 100
  newUtilizationPct: number; // balance / new limit * 100
  utilizationDropPct: number; // current - new, in points
  // Spend headroom you can use before crossing the recommended 30% line.
  headroomAt30: number;
  crossesHealthyLine: boolean; // true if new utilization is at or below 30%
}

export function computeCreditLimit(input: CreditLimitInput): CreditLimitResult | null {
  const { currentLimit, currentBalance, increaseAmount } = input;

  if (!Number.isFinite(currentLimit) || currentLimit <= 0) return null;
  if (!Number.isFinite(currentBalance) || currentBalance < 0) return null;
  if (!Number.isFinite(increaseAmount) || increaseAmount < 0) return null;

  const newLimit = currentLimit + increaseAmount;
  const currentUtilizationPct = (currentBalance / currentLimit) * 100;
  const newUtilizationPct = (currentBalance / newLimit) * 100;
  const utilizationDropPct = currentUtilizationPct - newUtilizationPct;

  const headroomAt30 = newLimit * 0.3 - currentBalance;

  return {
    newLimit,
    currentUtilizationPct,
    newUtilizationPct,
    utilizationDropPct,
    headroomAt30,
    crossesHealthyLine: newUtilizationPct <= 30,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
