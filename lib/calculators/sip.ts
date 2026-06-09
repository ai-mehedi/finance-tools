// Pure logic for the SIP (Systematic Investment Plan) Calculator.
// A SIP invests a fixed amount every month. The future value of the stream is
//   FV = P * (((1 + i)^n - 1) / i) * (1 + i)
// where P is the monthly investment, i is the monthly rate (annualRatePct/100/12)
// and n is the total number of months (years * 12). When i == 0, FV = P * n.
// A per-year schedule (invested vs value) is exposed for charting.

export interface SipInput {
  monthlyInvestment: number;
  annualRatePct: number;
  years: number;
}

export interface SipYearPoint {
  year: number;
  /** Total money paid in so far (monthly investment * months elapsed). */
  invested: number;
  /** Estimated portfolio value so far. */
  value: number;
  /** value - invested = estimated returns so far. */
  returns: number;
}

export interface SipResult {
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  schedule: SipYearPoint[]; // one point per year, starting at year 0
}

/** Future value of an annuity-due of `months` contributions at monthly rate `i`. */
function annuityDueFV(payment: number, i: number, months: number): number {
  if (months <= 0) return 0;
  if (i === 0) return payment * months;
  return payment * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
}

export function computeSip(input: SipInput): SipResult | null {
  const { monthlyInvestment, annualRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(monthlyInvestment) || monthlyInvestment < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const i = annualRatePct / 100 / 12;
  const months = Math.round(years * 12);

  const schedule: SipYearPoint[] = [
    { year: 0, invested: 0, value: 0, returns: 0 },
  ];

  for (let m = 12; m <= months; m += 12) {
    const invested = monthlyInvestment * m;
    const value = annuityDueFV(monthlyInvestment, i, m);
    schedule.push({ year: m / 12, invested, value, returns: value - invested });
  }

  const totalInvested = monthlyInvestment * months;
  const futureValue = annuityDueFV(monthlyInvestment, i, months);
  const estimatedReturns = futureValue - totalInvested;

  return { totalInvested, estimatedReturns, futureValue, schedule };
}

// Fixed en-US locale so server and client render identical strings (no hydration mismatch).
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUSD(n: number): string {
  return usd.format(Number.isFinite(n) ? n : 0);
}

/** Compact axis labels like $1.2k / $3.4M. */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
