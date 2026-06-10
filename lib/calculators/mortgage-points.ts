// Pure logic for the Mortgage Points Calculator.
// Each discount point costs 1 percent of the loan amount and buys down the
// interest rate. This compares the loan with points against the loan without
// them: the upfront cost, the lower monthly payment, the months needed to
// break even, and the lifetime savings if you keep the loan to term.

export interface MortgagePointsInput {
  loanAmount: number;
  baseRatePct: number; // rate before buying points
  termYears: number;
  points: number; // number of discount points purchased
  rateReductionPerPoint: number; // percentage points knocked off per point
}

export interface PointsCumulativePoint {
  month: number;
  withoutPointsPaid: number; // cumulative cash out with no points
  withPointsPaid: number; // cumulative cash out with points (incl. upfront)
}

export interface MortgagePointsResult {
  pointsCost: number; // upfront cost of the points
  rateWithPoints: number;
  paymentWithoutPoints: number;
  paymentWithPoints: number;
  monthlySavings: number;
  breakEvenMonths: number | null; // null if it never breaks even
  breakEvenLabel: string;
  lifetimeSavings: number; // net savings over the full term after upfront cost
  schedule: PointsCumulativePoint[];
}

function monthlyPayment(principal: number, ratePct: number, n: number): number {
  const r = ratePct / 100 / 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

export function computeMortgagePoints(input: MortgagePointsInput): MortgagePointsResult | null {
  const { loanAmount, baseRatePct, termYears, points, rateReductionPerPoint } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(baseRatePct) || baseRatePct < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(points) || points < 0) return null;
  if (!Number.isFinite(rateReductionPerPoint) || rateReductionPerPoint < 0) return null;

  const n = Math.round(termYears * 12);
  const pointsCost = loanAmount * (points / 100);
  const rateWithPoints = Math.max(baseRatePct - points * rateReductionPerPoint, 0);

  const paymentWithoutPoints = monthlyPayment(loanAmount, baseRatePct, n);
  const paymentWithPoints = monthlyPayment(loanAmount, rateWithPoints, n);
  const monthlySavings = paymentWithoutPoints - paymentWithPoints;

  let breakEvenMonths: number | null = null;
  if (monthlySavings > 0) {
    breakEvenMonths = Math.ceil(pointsCost / monthlySavings);
    if (breakEvenMonths > n) breakEvenMonths = null;
  }

  // Lifetime savings = total saved on payments over the term minus upfront cost.
  const lifetimeSavings = monthlySavings * n - pointsCost;

  // Cumulative cash-out schedule sampled yearly for charting.
  const schedule: PointsCumulativePoint[] = [{ month: 0, withoutPointsPaid: 0, withPointsPaid: pointsCost }];
  for (let m = 12; m <= n; m += 12) {
    schedule.push({
      month: m,
      withoutPointsPaid: paymentWithoutPoints * m,
      withPointsPaid: pointsCost + paymentWithPoints * m,
    });
  }
  if (schedule[schedule.length - 1].month !== n) {
    schedule.push({
      month: n,
      withoutPointsPaid: paymentWithoutPoints * n,
      withPointsPaid: pointsCost + paymentWithPoints * n,
    });
  }

  const breakEvenLabel =
    breakEvenMonths == null
      ? "Never within the term"
      : `${Math.floor(breakEvenMonths / 12)} yr ${breakEvenMonths % 12} mo`;

  return {
    pointsCost,
    rateWithPoints,
    paymentWithoutPoints,
    paymentWithPoints,
    monthlySavings,
    breakEvenMonths,
    breakEvenLabel,
    lifetimeSavings,
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
