// Pure logic for the Time Value of Money (TVM) Calculator.
// Solves the classic five-variable TVM relationship: given any four of
// present value (PV), future value (FV), periodic payment (PMT), the periodic
// interest rate and the number of periods, find the fifth. Here we solve for
// the unknown the user selects and also expose a per-period balance schedule
// so the page can chart how the balance evolves.

export type SolveFor = "fv" | "pv" | "pmt" | "rate";

export type PaymentTiming = "end" | "begin"; // ordinary annuity vs annuity-due

export interface TvmInput {
  solveFor: SolveFor;
  presentValue: number; // PV, money in your hand today
  futureValue: number; // FV, target balance later
  payment: number; // PMT, recurring deposit/withdrawal per period
  annualRatePct: number; // nominal annual interest rate, percent
  years: number; // length of horizon in years
  periodsPerYear: number; // compounding/payment periods per year
  timing: PaymentTiming;
}

export interface TvmPoint {
  period: number;
  balance: number;
}

export interface TvmResult {
  solveFor: SolveFor;
  value: number; // the solved-for quantity (rate is returned as percent per year)
  presentValue: number;
  futureValue: number;
  payment: number;
  annualRatePct: number;
  periods: number; // total periods = years times periodsPerYear
  periodicRatePct: number; // rate per period, percent
  schedule: TvmPoint[];
}

// Future value of a PV and a level PMT after `n` periods at per-period rate `i`.
// `due` adds one period of growth to every payment (annuity-due).
function fvOf(pv: number, pmt: number, i: number, n: number, due: boolean): number {
  if (i === 0) return pv + pmt * n;
  const growth = Math.pow(1 + i, n);
  const annuity = (pmt * (growth - 1)) / i * (due ? 1 + i : 1);
  return pv * growth + annuity;
}

function buildSchedule(pv: number, pmt: number, i: number, n: number, due: boolean): TvmPoint[] {
  const pts: TvmPoint[] = [{ period: 0, balance: pv }];
  let bal = pv;
  for (let p = 1; p <= n; p++) {
    if (due) bal = (bal + pmt) * (1 + i);
    else bal = bal * (1 + i) + pmt;
    pts.push({ period: p, balance: bal });
  }
  return pts;
}

// Solve for the per-period rate with bisection on the FV residual.
function solveRate(pv: number, fv: number, pmt: number, n: number, due: boolean): number | null {
  const f = (i: number) => fvOf(pv, pmt, i, n, due) - fv;
  let lo = -0.9999;
  let hi = 1; // up to 100% per period
  let flo = f(lo);
  let fhi = f(hi);
  if (flo === 0) return lo;
  if (fhi === 0) return hi;
  if (flo * fhi > 0) return null; // no sign change, cannot bracket a root
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-9 || hi - lo < 1e-12) return mid;
    if (flo * fm < 0) {
      hi = mid;
      fhi = fm;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

export function computeTvm(input: TvmInput): TvmResult | null {
  const { solveFor, presentValue, futureValue, payment, annualRatePct, years, periodsPerYear, timing } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(periodsPerYear) || periodsPerYear <= 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;

  const n = Math.round(years * periodsPerYear);
  if (n <= 0) return null;
  const due = timing === "begin";
  const i = annualRatePct / 100 / periodsPerYear;

  let pv = presentValue;
  let fv = futureValue;
  let pmt = payment;
  let ratePct = annualRatePct;
  let periodicRate = i;
  let value: number;

  if (solveFor === "fv") {
    fv = fvOf(pv, pmt, i, n, due);
    value = fv;
  } else if (solveFor === "pv") {
    // FV = PV*(1+i)^n + annuity  =>  PV = (FV - annuity) / (1+i)^n
    const growth = Math.pow(1 + i, n);
    const annuity = i === 0 ? pmt * n : (pmt * (growth - 1)) / i * (due ? 1 + i : 1);
    pv = (fv - annuity) / growth;
    value = pv;
  } else if (solveFor === "pmt") {
    const growth = Math.pow(1 + i, n);
    if (i === 0) {
      pmt = (fv - pv) / n;
    } else {
      const factor = ((growth - 1) / i) * (due ? 1 + i : 1);
      pmt = (fv - pv * growth) / factor;
    }
    value = pmt;
  } else {
    const solved = solveRate(pv, fv, pmt, n, due);
    if (solved === null || !Number.isFinite(solved)) return null;
    periodicRate = solved;
    ratePct = solved * periodsPerYear * 100;
    value = ratePct;
  }

  const schedule = buildSchedule(pv, pmt, periodicRate, n, due);

  return {
    solveFor,
    value,
    presentValue: pv,
    futureValue: solveFor === "fv" ? value : fv,
    payment: pmt,
    annualRatePct: ratePct,
    periods: n,
    periodicRatePct: periodicRate * 100,
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
