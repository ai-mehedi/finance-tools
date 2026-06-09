// Pure logic for the Dividend Yield Calculator.
// Dividend yield is the annual dividend per share divided by the share price.
// Yield on cost compares the same annual dividend to your original cost basis.

export interface DividendYieldInput {
  sharePrice: number; // current price per share
  annualDividend: number; // total dividend per share over a year
  shares: number; // number of shares held (optional, for income)
  costBasis: number; // price you originally paid per share (optional)
}

export interface DividendYieldResult {
  dividendYieldPct: number; // annual yield on current price
  yieldOnCostPct: number; // annual yield on original cost basis
  annualIncome: number; // total annual dividend income for the position
  quarterlyIncome: number;
  monthlyIncome: number;
  positionValue: number; // shares * current price
}

export function computeDividendYield(input: DividendYieldInput): DividendYieldResult | null {
  const { sharePrice, annualDividend, shares, costBasis } = input;

  if (!Number.isFinite(sharePrice) || sharePrice <= 0) return null;
  if (!Number.isFinite(annualDividend) || annualDividend < 0) return null;
  if (shares < 0 || costBasis < 0) return null;

  const dividendYieldPct = (annualDividend / sharePrice) * 100;
  const yieldOnCostPct = costBasis > 0 ? (annualDividend / costBasis) * 100 : dividendYieldPct;

  const annualIncome = annualDividend * shares;
  const quarterlyIncome = annualIncome / 4;
  const monthlyIncome = annualIncome / 12;
  const positionValue = sharePrice * shares;

  return {
    dividendYieldPct,
    yieldOnCostPct,
    annualIncome,
    quarterlyIncome,
    monthlyIncome,
    positionValue,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;
