// Pure logic for the Fixed Deposit (FD) Calculator.
// A fixed deposit pays compound interest on a single lump sum over a fixed term.
// Maturity value uses A = P(1 + r/n)^(n*t), where n is the compounding frequency
// per year. A per-year schedule of the growing balance is produced for charting.

export type Compounding = "monthly" | "quarterly" | "halfyearly" | "yearly";

export const COMPOUND_PER_YEAR: Record<Compounding, number> = {
  monthly: 12,
  quarterly: 4,
  halfyearly: 2,
  yearly: 1,
};

export interface FdInput {
  principal: number;
  annualRatePct: number;
  years: number;
  compounding: Compounding;
}

export interface FdYearPoint {
  year: number;
  balance: number;
  interest: number; // cumulative interest earned by end of year
}

export interface FdResult {
  maturityValue: number;
  totalInterest: number;
  principal: number;
  schedule: FdYearPoint[]; // one point per year, starting at year 0
}

export function computeFd(input: FdInput): FdResult | null {
  const { principal, annualRatePct, years, compounding } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (annualRatePct < 0 || !Number.isFinite(annualRatePct)) return null;

  const n = COMPOUND_PER_YEAR[compounding];
  const r = annualRatePct / 100;

  const balanceAt = (t: number) => principal * Math.pow(1 + r / n, n * t);

  const schedule: FdYearPoint[] = [{ year: 0, balance: principal, interest: 0 }];
  const wholeYears = Math.floor(years);
  for (let y = 1; y <= wholeYears; y++) {
    const balance = balanceAt(y);
    schedule.push({ year: y, balance, interest: balance - principal });
  }
  // Add the final fractional point so the chart and totals reflect the exact term.
  if (years > wholeYears) {
    const balance = balanceAt(years);
    schedule.push({ year: years, balance, interest: balance - principal });
  }

  const maturityValue = balanceAt(years);
  const totalInterest = maturityValue - principal;

  return { maturityValue, totalInterest, principal, schedule };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
