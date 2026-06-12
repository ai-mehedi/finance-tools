// Pure logic for the Sales Revenue Calculator.
// Computes gross revenue, discounts, returns, net revenue, cost of goods sold
// and gross profit from units sold, price per unit and a few rate assumptions.
// Exposes a per-unit-step schedule so revenue can be charted against volume.

export interface SalesRevenueInput {
  unitsSold: number;
  pricePerUnit: number;
  unitCost: number; // cost of goods per unit
  discountPct: number; // average discount applied to gross sales
  returnsPct: number; // share of units returned/refunded
}

export interface RevenueVolumePoint {
  units: number;
  netRevenue: number;
  grossProfit: number;
}

export interface SalesRevenueResult {
  grossRevenue: number;
  discountAmount: number;
  returnsAmount: number;
  netRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPct: number;
  effectivePrice: number; // net revenue per unit actually kept
  schedule: RevenueVolumePoint[];
}

export function computeSalesRevenue(input: SalesRevenueInput): SalesRevenueResult | null {
  const { unitsSold, pricePerUnit, unitCost, discountPct, returnsPct } = input;

  if (!Number.isFinite(unitsSold) || unitsSold < 0) return null;
  if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) return null;
  if (!Number.isFinite(unitCost) || unitCost < 0) return null;
  if (!Number.isFinite(discountPct) || discountPct < 0 || discountPct > 100) return null;
  if (!Number.isFinite(returnsPct) || returnsPct < 0 || returnsPct > 100) return null;

  const d = discountPct / 100;
  const ret = returnsPct / 100;

  const netRevenueAt = (units: number) => {
    const gross = units * pricePerUnit;
    const afterDiscount = gross * (1 - d);
    return afterDiscount * (1 - ret);
  };

  const grossProfitAt = (units: number) => {
    const keptUnits = units * (1 - ret);
    const cost = keptUnits * unitCost;
    return netRevenueAt(units) - cost;
  };

  const grossRevenue = unitsSold * pricePerUnit;
  const discountAmount = grossRevenue * d;
  const afterDiscount = grossRevenue - discountAmount;
  const returnsAmount = afterDiscount * ret;
  const netRevenue = afterDiscount - returnsAmount;

  const keptUnits = unitsSold * (1 - ret);
  const totalCost = keptUnits * unitCost;
  const grossProfit = netRevenue - totalCost;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const effectivePrice = unitsSold > 0 ? netRevenue / unitsSold : 0;

  // Revenue and profit across a range of volumes for charting.
  const schedule: RevenueVolumePoint[] = [];
  const maxUnits = Math.max(unitsSold, 1);
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const units = (maxUnits / steps) * i;
    schedule.push({
      units,
      netRevenue: netRevenueAt(units),
      grossProfit: grossProfitAt(units),
    });
  }

  return {
    grossRevenue,
    discountAmount,
    returnsAmount,
    netRevenue,
    totalCost,
    grossProfit,
    grossMarginPct,
    effectivePrice,
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
