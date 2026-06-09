// Pure logic for the Commission Calculator.
// Computes earned commission from a sales amount and a commission rate, with an
// optional base salary and an optional tiered rate that applies a higher rate to
// sales above a threshold.

export interface CommissionInput {
  salesAmount: number;
  commissionRatePct: number;
  baseSalary?: number; // fixed pay added on top of commission
  tierThreshold?: number; // sales above this earn the tier rate
  tierRatePct?: number; // rate applied to sales above the threshold
}

export interface CommissionResult {
  baseCommission: number; // commission on sales up to the threshold
  tierCommission: number; // commission on sales above the threshold
  totalCommission: number;
  baseSalary: number;
  totalPay: number; // base salary + total commission
  effectiveRatePct: number; // total commission as a percent of sales
}

export function computeCommission(input: CommissionInput): CommissionResult | null {
  const {
    salesAmount,
    commissionRatePct,
    baseSalary = 0,
    tierThreshold = 0,
    tierRatePct,
  } = input;

  if (!Number.isFinite(salesAmount) || salesAmount < 0) return null;
  if (!Number.isFinite(commissionRatePct) || commissionRatePct < 0) return null;
  if (baseSalary < 0) return null;

  const useTier =
    Number.isFinite(tierThreshold) &&
    tierThreshold > 0 &&
    typeof tierRatePct === "number" &&
    Number.isFinite(tierRatePct) &&
    tierRatePct >= 0 &&
    salesAmount > tierThreshold;

  const baseSales = useTier ? tierThreshold : salesAmount;
  const tierSales = useTier ? salesAmount - tierThreshold : 0;

  const baseCommission = baseSales * (commissionRatePct / 100);
  const tierCommission = useTier ? tierSales * ((tierRatePct as number) / 100) : 0;
  const totalCommission = baseCommission + tierCommission;
  const totalPay = baseSalary + totalCommission;
  const effectiveRatePct = salesAmount > 0 ? (totalCommission / salesAmount) * 100 : 0;

  return {
    baseCommission,
    tierCommission,
    totalCommission,
    baseSalary,
    totalPay,
    effectiveRatePct,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
