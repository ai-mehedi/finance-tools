// Pure logic for the XIRR Calculator.
// XIRR is the internal rate of return for a series of cash flows that occur on
// irregular dates. It solves for the annual rate that makes the net present
// value of all dated cash flows equal to zero, discounting each flow on an
// actual/365 day basis from the first cash-flow date.

export interface XirrCashFlow {
  date: string; // ISO date string, e.g. "2024-01-15"
  amount: number; // negative for money invested (outflow), positive for money received (inflow)
}

export interface XirrInput {
  flows: XirrCashFlow[];
}

export interface XirrSchedulePoint {
  date: string;
  label: string; // short month/year label for the chart axis
  amount: number;
  cumulative: number; // running sum of signed cash flows
}

export interface XirrResult {
  rate: number; // annualized XIRR as a decimal (0.18 = 18%)
  ratePct: number; // same value expressed as a percentage
  totalInvested: number; // sum of all outflows, as a positive number
  totalReturned: number; // sum of all inflows
  netGain: number; // totalReturned minus totalInvested
  days: number; // span in days from first to last cash flow
  iterations: number; // how many Newton iterations were used
  schedule: XirrSchedulePoint[];
}

const MS_PER_DAY = 86_400_000;

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

// Net present value of the dated flows at a trial annual rate.
function xnpv(rate: number, flows: { date: Date; amount: number }[], t0: Date): number {
  let acc = 0;
  for (const f of flows) {
    const years = daysBetween(t0, f.date) / 365;
    acc += f.amount / Math.pow(1 + rate, years);
  }
  return acc;
}

// Derivative of xnpv with respect to rate, used for the Newton step.
function dxnpv(rate: number, flows: { date: Date; amount: number }[], t0: Date): number {
  let acc = 0;
  for (const f of flows) {
    const years = daysBetween(t0, f.date) / 365;
    if (years === 0) continue;
    acc += (-years * f.amount) / Math.pow(1 + rate, years + 1);
  }
  return acc;
}

export function computeXirr(input: XirrInput): XirrResult | null {
  const raw = input.flows
    .filter((f) => f.date && Number.isFinite(f.amount) && f.amount !== 0)
    .map((f) => ({ date: new Date(f.date), amount: f.amount, iso: f.date }))
    .filter((f) => !Number.isNaN(f.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (raw.length < 2) return null;

  const hasOutflow = raw.some((f) => f.amount < 0);
  const hasInflow = raw.some((f) => f.amount > 0);
  if (!hasOutflow || !hasInflow) return null;

  const t0 = raw[0].date;
  const flows = raw.map((f) => ({ date: f.date, amount: f.amount }));

  // Newton-Raphson with a damped step; fall back to bisection if it diverges.
  let rate = 0.1;
  let iterations = 0;
  let converged = false;

  for (let i = 0; i < 100; i++) {
    iterations = i + 1;
    const value = xnpv(rate, flows, t0);
    const deriv = dxnpv(rate, flows, t0);
    if (Math.abs(value) < 1e-7) {
      converged = true;
      break;
    }
    if (deriv === 0 || !Number.isFinite(deriv)) break;
    let next = rate - value / deriv;
    // Keep the rate above -1 (a -100% return) so discount factors stay valid.
    if (next <= -0.9999) next = (rate - 0.9999) / 2;
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - rate) < 1e-9) {
      rate = next;
      converged = true;
      break;
    }
    rate = next;
  }

  if (!converged) {
    // Bisection fallback over a wide bracket.
    let lo = -0.9999;
    let hi = 100;
    let flo = xnpv(lo, flows, t0);
    let fhi = xnpv(hi, flows, t0);
    if (flo * fhi > 0) return null;
    for (let i = 0; i < 200; i++) {
      iterations += 1;
      const mid = (lo + hi) / 2;
      const fmid = xnpv(mid, flows, t0);
      if (Math.abs(fmid) < 1e-7) {
        rate = mid;
        converged = true;
        break;
      }
      if (flo * fmid < 0) {
        hi = mid;
        fhi = fmid;
      } else {
        lo = mid;
        flo = fmid;
      }
      rate = mid;
    }
  }

  if (!Number.isFinite(rate)) return null;

  let totalInvested = 0;
  let totalReturned = 0;
  let cumulative = 0;
  const schedule: XirrSchedulePoint[] = raw.map((f) => {
    if (f.amount < 0) totalInvested += -f.amount;
    else totalReturned += f.amount;
    cumulative += f.amount;
    const d = f.date;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
    return { date: f.iso, label, amount: f.amount, cumulative };
  });

  const days = Math.round(daysBetween(t0, raw[raw.length - 1].date));

  return {
    rate,
    ratePct: rate * 100,
    totalInvested,
    totalReturned,
    netGain: totalReturned - totalInvested,
    days,
    iterations,
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

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  return `${n.toFixed(2)}%`;
}
