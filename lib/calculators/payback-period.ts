// Pure logic for the Payback Period Calculator.
// Computes how long it takes an investment's cumulative cash inflows to recover
// the initial outlay. Supports a simple (undiscounted) payback period and a
// discounted payback period that applies a yearly discount rate to each inflow.
// Returns a per-year schedule of cumulative cash flow for charting.

export interface PaybackInput {
  initialInvestment: number;
  annualCashFlow: number;
  years: number;
  discountRatePct: number;
}

export interface PaybackYearPoint {
  year: number;
  cashFlow: number; // nominal inflow received this year
  cumulative: number; // running undiscounted cumulative net cash flow
  discountedCumulative: number; // running discounted cumulative net cash flow
}

export interface PaybackResult {
  paybackYears: number | null; // simple payback in years, null if never recovered
  discountedPaybackYears: number | null;
  totalCashFlow: number; // total nominal inflows across the horizon
  netProfit: number; // total inflows minus the initial investment
  recovered: boolean;
  schedule: PaybackYearPoint[];
}

export function computePayback(input: PaybackInput): PaybackResult | null {
  const { initialInvestment, annualCashFlow, years, discountRatePct } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(initialInvestment) || initialInvestment <= 0) return null;
  if (!Number.isFinite(annualCashFlow) || annualCashFlow < 0) return null;
  if (!Number.isFinite(discountRatePct) || discountRatePct < 0) return null;

  const n = Math.round(years);
  const r = discountRatePct / 100;

  let cumulative = -initialInvestment;
  let discountedCumulative = -initialInvestment;

  let paybackYears: number | null = null;
  let discountedPaybackYears: number | null = null;

  const schedule: PaybackYearPoint[] = [
    { year: 0, cashFlow: 0, cumulative, discountedCumulative },
  ];

  for (let y = 1; y <= n; y++) {
    const discountedFlow = annualCashFlow / Math.pow(1 + r, y);

    const prevCumulative = cumulative;
    const prevDiscounted = discountedCumulative;

    cumulative += annualCashFlow;
    discountedCumulative += discountedFlow;

    if (paybackYears === null && cumulative >= 0) {
      // Linear interpolation within the year of recovery.
      const needed = -prevCumulative; // amount still to recover at start of year
      const fraction = annualCashFlow > 0 ? needed / annualCashFlow : 0;
      paybackYears = y - 1 + Math.min(Math.max(fraction, 0), 1);
    }

    if (discountedPaybackYears === null && discountedCumulative >= 0) {
      const needed = -prevDiscounted;
      const fraction = discountedFlow > 0 ? needed / discountedFlow : 0;
      discountedPaybackYears = y - 1 + Math.min(Math.max(fraction, 0), 1);
    }

    schedule.push({ year: y, cashFlow: annualCashFlow, cumulative, discountedCumulative });
  }

  const totalCashFlow = annualCashFlow * n;
  const netProfit = totalCashFlow - initialInvestment;

  return {
    paybackYears,
    discountedPaybackYears,
    totalCashFlow,
    netProfit,
    recovered: paybackYears !== null,
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

export function formatYears(y: number | null): string {
  if (y === null || !Number.isFinite(y)) return "Never";
  const whole = Math.floor(y);
  const months = Math.round((y - whole) * 12);
  if (months === 0) return `${whole} yr`;
  if (months === 12) return `${whole + 1} yr`;
  return `${whole} yr ${months} mo`;
}
