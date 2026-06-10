// Pure logic for the NPV (Net Present Value) Calculator.
// Discounts a series of future cash flows back to today at a chosen discount
// rate and subtracts the initial investment. Also reports the discounted
// payback period and a simple IRR estimate, and exposes a per-year schedule
// (cumulative discounted cash flow) for charting.

export interface NpvInput {
  initialInvestment: number; // outflow at time 0 (entered as a positive number)
  discountRatePct: number; // annual discount rate, percent
  cashFlows: number[]; // expected net cash flow for years 1..N
}

export interface NpvYearPoint {
  year: number;
  cashFlow: number; // raw cash flow for that year (year 0 = -investment)
  discounted: number; // present value of that year's cash flow
  cumulative: number; // running sum of discounted cash flows
}

export interface NpvResult {
  npv: number;
  totalInflows: number; // sum of undiscounted positive cash flows
  totalDiscountedInflows: number; // sum of discounted cash flows years 1..N
  initialInvestment: number;
  profitabilityIndex: number; // discounted inflows / investment
  irrPct: number | null; // estimated internal rate of return, percent
  paybackYear: number | null; // discounted payback period in years (interpolated)
  schedule: NpvYearPoint[];
}

function npvAtRate(initialInvestment: number, cashFlows: number[], ratePct: number): number {
  const r = ratePct / 100;
  let sum = -initialInvestment;
  for (let t = 0; t < cashFlows.length; t++) {
    sum += cashFlows[t] / Math.pow(1 + r, t + 1);
  }
  return sum;
}

// Estimate IRR with the bisection method between -90% and 1000%.
function estimateIrr(initialInvestment: number, cashFlows: number[]): number | null {
  let lo = -0.9;
  let hi = 10;
  const f = (rate: number) => {
    let sum = -initialInvestment;
    for (let t = 0; t < cashFlows.length; t++) sum += cashFlows[t] / Math.pow(1 + rate, t + 1);
    return sum;
  };
  let flo = f(lo);
  let fhi = f(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fmid = f(mid);
    if (Math.abs(fmid) < 1e-7) return mid * 100;
    if (flo * fmid < 0) {
      hi = mid;
      fhi = fmid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return ((lo + hi) / 2) * 100;
}

export function computeNpv(input: NpvInput): NpvResult | null {
  const { initialInvestment, discountRatePct, cashFlows } = input;

  if (!Number.isFinite(initialInvestment) || initialInvestment < 0) return null;
  if (!Number.isFinite(discountRatePct)) return null;
  if (!cashFlows.length || cashFlows.some((c) => !Number.isFinite(c))) return null;

  const r = discountRatePct / 100;

  const schedule: NpvYearPoint[] = [
    {
      year: 0,
      cashFlow: -initialInvestment,
      discounted: -initialInvestment,
      cumulative: -initialInvestment,
    },
  ];

  let cumulative = -initialInvestment;
  let totalInflows = 0;
  let totalDiscountedInflows = 0;
  let paybackYear: number | null = null;

  for (let t = 0; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    const discounted = cf / Math.pow(1 + r, t + 1);
    const prevCumulative = cumulative;
    cumulative += discounted;
    totalInflows += cf;
    totalDiscountedInflows += discounted;

    if (paybackYear === null && prevCumulative < 0 && cumulative >= 0) {
      // Interpolate within the year the cumulative discounted flow crosses zero.
      const fraction = discounted !== 0 ? -prevCumulative / discounted : 0;
      paybackYear = t + fraction;
    }

    schedule.push({ year: t + 1, cashFlow: cf, discounted, cumulative });
  }

  const npv = cumulative;
  const profitabilityIndex = initialInvestment > 0 ? totalDiscountedInflows / initialInvestment : 0;
  const irrPct = estimateIrr(initialInvestment, cashFlows);

  return {
    npv,
    totalInflows,
    totalDiscountedInflows,
    initialInvestment,
    profitabilityIndex,
    irrPct,
    paybackYear,
    schedule,
  };
}

export { npvAtRate };

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
