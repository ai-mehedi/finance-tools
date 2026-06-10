// Pure logic for the Money Doubling Time Calculator.
// Computes how long an investment takes to double (and to reach an optional
// custom multiple) at a given annual return and compounding frequency, using
// the exact logarithmic formula. Also reports the classic Rule of 72 and
// Rule of 69.3 estimates, and a growth schedule for charting until the target.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily" | "continuous";

export const FREQ_PER_YEAR: Record<Exclude<Frequency, "continuous">, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface MoneyDoublingInput {
  principal: number;
  annualRatePct: number;
  frequency: Frequency;
  targetMultiple: number; // e.g. 2 to double, 3 to triple
}

export interface DoublingYearPoint {
  year: number;
  balance: number;
}

export interface MoneyDoublingResult {
  exactYears: number; // years to reach the target multiple (exact)
  doubleYears: number; // years to exactly double
  rule72Years: number; // 72 / rate% — applies to doubling
  rule693Years: number; // 69.3 / rate% — continuous-compounding approximation
  effectiveAnnualRatePct: number;
  targetValue: number; // principal times target multiple
  schedule: DoublingYearPoint[];
}

function effectiveAnnualRate(annualRatePct: number, frequency: Frequency): number {
  const r = annualRatePct / 100;
  if (frequency === "continuous") return Math.exp(r) - 1;
  const n = FREQ_PER_YEAR[frequency];
  return Math.pow(1 + r / n, n) - 1;
}

function yearsToMultiple(multiple: number, effRate: number): number {
  // balance = principal * (1 + effRate)^t  =>  t = ln(multiple) / ln(1 + effRate)
  if (effRate <= 0) return Infinity;
  return Math.log(multiple) / Math.log(1 + effRate);
}

export function computeMoneyDoubling(input: MoneyDoublingInput): MoneyDoublingResult | null {
  const { principal, annualRatePct, frequency, targetMultiple } = input;

  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct <= 0) return null;
  if (!Number.isFinite(targetMultiple) || targetMultiple <= 1) return null;

  const effRate = effectiveAnnualRate(annualRatePct, frequency);
  if (effRate <= 0) return null;

  const exactYears = yearsToMultiple(targetMultiple, effRate);
  const doubleYears = yearsToMultiple(2, effRate);
  const rule72Years = 72 / annualRatePct;
  const rule693Years = 69.3 / annualRatePct;

  const targetValue = principal * targetMultiple;

  if (!Number.isFinite(exactYears)) return null;

  // Build a yearly schedule up to the target (cap at the target year, min 1 year span).
  const endYear = Math.max(1, Math.ceil(exactYears));
  const schedule: DoublingYearPoint[] = [];
  for (let y = 0; y <= endYear; y++) {
    schedule.push({ year: y, balance: principal * Math.pow(1 + effRate, y) });
  }

  return {
    exactYears,
    doubleYears,
    rule72Years,
    rule693Years,
    effectiveAnnualRatePct: effRate * 100,
    targetValue,
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

export function formatYears(years: number): string {
  if (!Number.isFinite(years)) return "—";
  const whole = Math.floor(years);
  const months = Math.round((years - whole) * 12);
  if (months === 0) return `${whole} yr`;
  if (months === 12) return `${whole + 1} yr`;
  return `${whole} yr ${months} mo`;
}
