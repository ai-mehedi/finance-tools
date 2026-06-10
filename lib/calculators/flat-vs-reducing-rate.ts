// Pure logic for the Flat vs Reducing Rate Calculator.
// A flat-rate loan charges interest on the original principal for every period,
// regardless of how much you have repaid. A reducing-balance (diminishing) loan
// charges interest only on the outstanding balance, like a standard EMI loan.
// This module computes both for the same nominal rate so the true cost gap is
// visible, and exposes a per-year schedule of the outstanding balance for charting.

export interface FlatReducingInput {
  principal: number;
  annualRatePct: number; // nominal annual rate, applied as flat AND as reducing
  years: number;
}

export interface FlatReducingYearPoint {
  year: number;
  flatBalance: number; // outstanding principal still owed under flat scheme
  reducingBalance: number; // outstanding principal under reducing scheme
}

export interface FlatReducingResult {
  principal: number;
  months: number;
  // Flat-rate scheme
  flatMonthlyPayment: number;
  flatTotalInterest: number;
  flatTotalPaid: number;
  // Reducing-balance scheme
  reducingMonthlyPayment: number;
  reducingTotalInterest: number;
  reducingTotalPaid: number;
  // The headline comparison
  interestSaved: number; // flat interest minus reducing interest
  effectiveFlatAprPct: number; // reducing rate that matches the flat payment
  schedule: FlatReducingYearPoint[];
}

// Solve for the nominal annual reducing rate whose EMI equals a target payment.
function impliedReducingRate(principal: number, payment: number, months: number): number {
  if (payment * months <= principal) return 0;
  // Bisection on the monthly rate.
  let lo = 0;
  let hi = 1; // 100% monthly is a generous upper bound
  const emiAt = (i: number) =>
    i === 0 ? principal / months : (principal * i) / (1 - Math.pow(1 + i, -months));
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (emiAt(mid) > payment) hi = mid;
    else lo = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

export function computeFlatReducing(input: FlatReducingInput): FlatReducingResult | null {
  const { principal, annualRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const months = Math.round(years * 12);
  const r = annualRatePct / 100;
  const i = r / 12; // monthly reducing rate

  // Flat scheme: interest = principal * rate * years, spread evenly.
  const flatTotalInterest = principal * r * years;
  const flatTotalPaid = principal + flatTotalInterest;
  const flatMonthlyPayment = flatTotalPaid / months;

  // Reducing scheme: standard amortising EMI.
  const reducingMonthlyPayment =
    i === 0 ? principal / months : (principal * i) / (1 - Math.pow(1 + i, -months));
  const reducingTotalPaid = reducingMonthlyPayment * months;
  const reducingTotalInterest = reducingTotalPaid - principal;

  const interestSaved = flatTotalInterest - reducingTotalInterest;
  const effectiveFlatAprPct = impliedReducingRate(principal, flatMonthlyPayment, months);

  // Build per-year outstanding-balance schedule for both schemes.
  // Flat: principal repaid evenly across all months.
  const flatPrincipalPerMonth = principal / months;
  let flatOut = principal;

  // Reducing: amortise month by month.
  let redOut = principal;

  const schedule: FlatReducingYearPoint[] = [
    { year: 0, flatBalance: principal, reducingBalance: principal },
  ];

  for (let m = 1; m <= months; m++) {
    flatOut -= flatPrincipalPerMonth;

    const redInterest = redOut * i;
    const redPrincipal = reducingMonthlyPayment - redInterest;
    redOut -= redPrincipal;

    if (m % 12 === 0 || m === months) {
      schedule.push({
        year: m / 12,
        flatBalance: Math.max(0, flatOut),
        reducingBalance: Math.max(0, redOut),
      });
    }
  }

  return {
    principal,
    months,
    flatMonthlyPayment,
    flatTotalInterest,
    flatTotalPaid,
    reducingMonthlyPayment,
    reducingTotalInterest,
    reducingTotalPaid,
    interestSaved,
    effectiveFlatAprPct,
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
