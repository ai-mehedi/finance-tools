// Pure logic for the Dividend Reinvestment (DRIP) Calculator.
// Models a dividend paying position where every dividend is used to buy more
// shares, and the dividend per share grows each year. Compounding both the
// share count and the dividend per share is what makes reinvestment powerful.
// A per-year schedule is exposed for charting the growing portfolio value.

export interface DripInput {
  initialInvestment: number; // dollars invested at the start
  sharePrice: number; // starting price per share
  annualDividendPerShare: number; // dividend per share in year one
  dividendGrowthPct: number; // annual growth of the dividend per share
  priceGrowthPct: number; // annual growth of the share price
  years: number;
  reinvest: boolean; // true = buy more shares, false = take dividends as cash
}

export interface DripYearPoint {
  year: number;
  value: number; // portfolio value at end of year
  shares: number;
  cashDividends: number; // cumulative dividends taken as cash (if not reinvesting)
}

export interface DripResult {
  finalValue: number; // shares value at the end (+ cash if not reinvesting)
  finalShares: number;
  totalDividends: number; // total dividends received over the period
  cashDividends: number; // dividends taken as cash (0 when reinvesting)
  startShares: number;
  schedule: DripYearPoint[];
}

export function computeDrip(input: DripInput): DripResult | null {
  const {
    initialInvestment,
    sharePrice,
    annualDividendPerShare,
    dividendGrowthPct,
    priceGrowthPct,
    years,
    reinvest,
  } = input;

  if (!Number.isFinite(initialInvestment) || initialInvestment <= 0) return null;
  if (!Number.isFinite(sharePrice) || sharePrice <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (annualDividendPerShare < 0 || dividendGrowthPct < 0) return null;

  const dg = dividendGrowthPct / 100;
  const pg = priceGrowthPct / 100;

  const startShares = initialInvestment / sharePrice;
  let shares = startShares;
  let price = sharePrice;
  let dps = annualDividendPerShare; // dividend per share for the current year
  let totalDividends = 0;
  let cashDividends = 0;

  const schedule: DripYearPoint[] = [
    { year: 0, value: initialInvestment, shares, cashDividends: 0 },
  ];

  const n = Math.round(years);

  for (let yr = 1; yr <= n; yr++) {
    // Price grows over the year; dividends are paid on the share count held.
    price = price * (1 + pg);
    const dividend = shares * dps;
    totalDividends += dividend;

    if (reinvest && price > 0) {
      shares += dividend / price;
    } else {
      cashDividends += dividend;
    }

    // Dividend per share grows for next year.
    dps = dps * (1 + dg);

    const value = shares * price + (reinvest ? 0 : cashDividends);
    schedule.push({ year: yr, value, shares, cashDividends });
  }

  const finalValue = shares * price + (reinvest ? 0 : cashDividends);

  return {
    finalValue,
    finalShares: shares,
    totalDividends,
    cashDividends,
    startShares,
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
