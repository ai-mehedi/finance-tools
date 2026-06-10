// Pure logic for the Pay Raise Calculator.
// Takes a current pay amount on some pay basis (hourly/weekly/monthly/annual)
// plus a raise expressed either as a percentage or as a flat amount, and works
// out the new pay, the increase, and how that increase looks across every pay
// basis. Optionally compares the raise against an inflation rate to show the
// real (inflation-adjusted) gain. Exposes a small schedule of annual pay over a
// few years (compounding the same raise) for charting.

export type PayBasis = "hourly" | "weekly" | "biweekly" | "monthly" | "annually";
export type RaiseMode = "percent" | "amount";

// Periods per year for converting any pay basis to an annual figure.
// Hourly assumes 40 hours/week, 52 weeks/year = 2080 hours.
export const PERIODS_PER_YEAR: Record<PayBasis, number> = {
  hourly: 2080,
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  annually: 1,
};

export interface PayRaiseInput {
  currentPay: number;
  payBasis: PayBasis;
  raiseMode: RaiseMode;
  raiseValue: number; // percent (e.g. 5) or flat amount in the chosen basis
  inflationPct: number; // annual inflation for the real-raise comparison
}

export interface PayRaiseYearPoint {
  year: number;
  annualPay: number;
}

export interface PayRaiseResult {
  raisePct: number; // effective percentage increase
  // Per-period figures
  oldPay: number;
  newPay: number;
  payIncrease: number;
  // Annualised figures
  oldAnnual: number;
  newAnnual: number;
  annualIncrease: number;
  // Real (inflation-adjusted) values
  realRaisePct: number; // raisePct minus inflation
  realNewAnnual: number; // new annual in today's purchasing power
  schedule: PayRaiseYearPoint[];
}

export function computePayRaise(input: PayRaiseInput): PayRaiseResult | null {
  const { currentPay, payBasis, raiseMode, raiseValue, inflationPct } = input;

  if (!Number.isFinite(currentPay) || currentPay <= 0) return null;
  if (!Number.isFinite(raiseValue)) return null;
  if (!Number.isFinite(inflationPct)) return null;

  const periods = PERIODS_PER_YEAR[payBasis];

  let newPay: number;
  let raisePct: number;
  if (raiseMode === "percent") {
    raisePct = raiseValue;
    newPay = currentPay * (1 + raiseValue / 100);
  } else {
    newPay = currentPay + raiseValue;
    raisePct = (raiseValue / currentPay) * 100;
  }

  const payIncrease = newPay - currentPay;
  const oldAnnual = currentPay * periods;
  const newAnnual = newPay * periods;
  const annualIncrease = newAnnual - oldAnnual;

  const realRaisePct = raisePct - inflationPct;
  const realNewAnnual = newAnnual / (1 + inflationPct / 100);

  // Project the same percentage raise compounding over 5 years.
  const schedule: PayRaiseYearPoint[] = [{ year: 0, annualPay: oldAnnual }];
  let pay = oldAnnual;
  for (let y = 1; y <= 5; y++) {
    pay = pay * (1 + raisePct / 100);
    schedule.push({ year: y, annualPay: pay });
  }

  return {
    raisePct,
    oldPay: currentPay,
    newPay,
    payIncrease,
    oldAnnual,
    newAnnual,
    annualIncrease,
    realRaisePct,
    realNewAnnual,
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
