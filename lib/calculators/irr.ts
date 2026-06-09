// Pure logic for the IRR (Internal Rate of Return) Calculator.
// IRR is the discount rate that makes the net present value of a series of
// cash flows equal to zero. The first cash flow is normally the initial
// outlay (a negative number), followed by one inflow per period.
// We solve for the rate numerically with a bracketed bisection search,
// which is robust across the wide range of inputs a user might enter.

export interface IrrInput {
  initialInvestment: number; // entered as a positive number, treated as an outflow
  cashFlows: number[]; // one inflow per period (year), in order
}

export interface IrrPeriodPoint {
  period: number; // 0 for the initial outlay, then 1..n
  cashFlow: number; // the cash flow in that period
  cumulative: number; // running sum of all cash flows up to and including this period
}

export interface IrrResult {
  irrPct: number | null; // annual IRR as a percentage, null if no sign change
  npvAtIrr: number; // residual NPV at the solved rate (near zero)
  totalInvested: number;
  totalReturned: number; // sum of the positive period cash flows
  netProfit: number; // totalReturned minus totalInvested
  schedule: IrrPeriodPoint[];
}

// Net present value of a full flow array at a given decimal rate.
function npv(rate: number, flows: number[]): number {
  let total = 0;
  for (let t = 0; t < flows.length; t++) {
    total += flows[t] / Math.pow(1 + rate, t);
  }
  return total;
}

export function computeIrr(input: IrrInput): IrrResult | null {
  const { initialInvestment, cashFlows } = input;

  if (!Number.isFinite(initialInvestment) || initialInvestment <= 0) return null;
  if (!cashFlows.length) return null;
  if (cashFlows.some((c) => !Number.isFinite(c))) return null;

  // flows[0] is the outlay, flows[1..n] are the inflows.
  const flows: number[] = [-initialInvestment, ...cashFlows];

  // Build the cumulative schedule.
  let running = 0;
  const schedule: IrrPeriodPoint[] = flows.map((cf, period) => {
    running += cf;
    return { period, cashFlow: cf, cumulative: running };
  });

  const totalInvested = initialInvestment;
  const totalReturned = cashFlows.reduce((s, c) => s + (c > 0 ? c : 0), 0);
  const netProfit = cashFlows.reduce((s, c) => s + c, 0) - initialInvestment;

  // Bisection needs the NPV to change sign across the bracket.
  let low = -0.9999; // rates below -100% are not meaningful here
  let high = 10; // 1000% upper bound covers almost any realistic case
  let fLow = npv(low, flows);
  let fHigh = npv(high, flows);

  let irrPct: number | null = null;
  let npvAtIrr = npv(0, flows);

  if (fLow * fHigh <= 0) {
    let mid = 0;
    for (let i = 0; i < 200; i++) {
      mid = (low + high) / 2;
      const fMid = npv(mid, flows);
      if (Math.abs(fMid) < 1e-7) break;
      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    irrPct = mid * 100;
    npvAtIrr = npv(mid, flows);
  }

  return {
    irrPct,
    npvAtIrr,
    totalInvested,
    totalReturned,
    netProfit,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
