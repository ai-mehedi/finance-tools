// Pure logic for the Capital Gains Calculator.
// Computes the capital gain (or loss) on a sale, the estimated tax at the
// chosen rate, and the net proceeds after tax. Long term vs short term simply
// changes the suggested default rate the widget passes in.

export interface CapitalGainsInput {
  purchasePrice: number; // cost basis, total
  salePrice: number; // total sale proceeds before selling costs
  sellingCosts: number; // commissions, fees, etc.
  taxRatePct: number; // applicable capital gains tax rate
}

export interface CapitalGainsResult {
  costBasis: number;
  netProceeds: number; // sale price minus selling costs
  capitalGain: number; // net proceeds minus cost basis (can be negative)
  isGain: boolean;
  taxableGain: number; // gain if positive, else 0
  taxOwed: number;
  afterTaxProfit: number; // capital gain minus tax owed
  returnPct: number; // after-tax profit as a percent of cost basis
}

export function computeCapitalGains(input: CapitalGainsInput): CapitalGainsResult | null {
  const { purchasePrice, salePrice, sellingCosts, taxRatePct } = input;

  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return null;
  if (salePrice < 0 || sellingCosts < 0 || taxRatePct < 0) return null;
  if (!Number.isFinite(salePrice) || !Number.isFinite(taxRatePct)) return null;

  const costBasis = purchasePrice;
  const netProceeds = salePrice - sellingCosts;
  const capitalGain = netProceeds - costBasis;
  const isGain = capitalGain > 0;

  const taxableGain = isGain ? capitalGain : 0;
  const taxOwed = (taxableGain * taxRatePct) / 100;
  const afterTaxProfit = capitalGain - taxOwed;
  const returnPct = costBasis > 0 ? (afterTaxProfit / costBasis) * 100 : 0;

  return {
    costBasis,
    netProceeds,
    capitalGain,
    isGain,
    taxableGain,
    taxOwed,
    afterTaxProfit,
    returnPct,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
