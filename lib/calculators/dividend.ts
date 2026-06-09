// Pure logic for the Dividend Calculator.
// Projects dividend income and portfolio value year by year. Dividends can be
// reinvested (DRIP) to buy more shares, the annual dividend per dollar invested
// can grow each year, and the share price can appreciate. The per-year schedule
// drives the growth chart.

export interface DividendInput {
  investment: number; // starting portfolio value
  dividendYieldPct: number; // current annual yield
  years: number;
  reinvest: boolean;
  dividendGrowthPct: number; // annual growth of the dividend yield
  priceGrowthPct: number; // annual share price appreciation
}

export interface DividendYearPoint {
  year: number;
  portfolioValue: number;
  annualDividend: number; // dividend paid during that year
  cumulativeDividends: number; // total dividends paid through that year
}

export interface DividendResult {
  totalDividends: number; // over the whole horizon
  finalPortfolioValue: number;
  finalAnnualDividend: number; // dividend in the last year
  schedule: DividendYearPoint[];
}

export function computeDividend(input: DividendInput): DividendResult | null {
  const {
    investment,
    dividendYieldPct,
    years,
    reinvest,
    dividendGrowthPct,
    priceGrowthPct,
  } = input;

  if (!Number.isFinite(investment) || investment < 0) return null;
  if (!Number.isFinite(dividendYieldPct) || dividendYieldPct < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(dividendGrowthPct) || dividendGrowthPct < 0) return null;
  if (!Number.isFinite(priceGrowthPct) || priceGrowthPct < 0) return null;

  const yearCount = Math.round(years);
  const priceGrowth = priceGrowthPct / 100;
  const divGrowth = dividendGrowthPct / 100;

  let portfolioValue = investment;
  let yieldRate = dividendYieldPct / 100;
  let cumulativeDividends = 0;

  const schedule: DividendYearPoint[] = [
    {
      year: 0,
      portfolioValue: investment,
      annualDividend: 0,
      cumulativeDividends: 0,
    },
  ];

  for (let y = 1; y <= yearCount; y++) {
    // Price appreciation applies to the existing holdings first.
    portfolioValue = portfolioValue * (1 + priceGrowth);
    // Dividend earned this year is the yield on the current portfolio value.
    const annualDividend = portfolioValue * yieldRate;
    cumulativeDividends += annualDividend;
    if (reinvest) {
      portfolioValue += annualDividend;
    }
    // The yield grows for next year as payouts rise.
    yieldRate = yieldRate * (1 + divGrowth);
    schedule.push({
      year: y,
      portfolioValue,
      annualDividend,
      cumulativeDividends,
    });
  }

  const last = schedule[schedule.length - 1];

  return {
    totalDividends: cumulativeDividends,
    finalPortfolioValue: last.portfolioValue,
    finalAnnualDividend: last.annualDividend,
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
