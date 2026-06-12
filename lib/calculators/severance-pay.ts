// Pure logic for the Severance Pay Calculator.
// Estimates a lump-sum severance package from years of service and a chosen
// number of weeks of pay granted per year worked, then layers on optional
// extras (a flat bonus and unused PTO payout). Also exposes a per-year-of-tenure
// schedule so the package can be plotted as it would have grown with seniority.

export type PayBasis = "annual" | "weekly";

export interface SeverancePayInput {
  annualSalary: number; // gross annual salary in USD
  yearsOfService: number; // completed years with the employer
  weeksPerYear: number; // weeks of pay granted per year of service
  capWeeks: number; // maximum total weeks of pay (0 means no cap)
  bonus: number; // flat additional payout (e.g. signing-off bonus)
  unusedPtoDays: number; // accrued, unused paid-time-off days to cash out
}

export interface SeveranceTenurePoint {
  year: number; // year of tenure
  weeks: number; // weeks of pay earned by that tenure (after cap)
  payout: number; // base severance payout at that tenure
}

export interface SeverancePayResult {
  weeklyPay: number;
  dailyPay: number;
  weeksGranted: number; // total weeks after applying any cap
  basePay: number; // weeklyPay times weeksGranted
  ptoPayout: number;
  bonus: number;
  totalSeverance: number;
  schedule: SeveranceTenurePoint[];
}

const WORK_DAYS_PER_WEEK = 5;

export function computeSeverancePay(input: SeverancePayInput): SeverancePayResult | null {
  const { annualSalary, yearsOfService, weeksPerYear, capWeeks, bonus, unusedPtoDays } = input;

  if (!Number.isFinite(annualSalary) || annualSalary < 0) return null;
  if (!Number.isFinite(yearsOfService) || yearsOfService <= 0) return null;
  if (!Number.isFinite(weeksPerYear) || weeksPerYear < 0) return null;
  if (capWeeks < 0 || bonus < 0 || unusedPtoDays < 0) return null;

  const weeklyPay = annualSalary / 52;
  const dailyPay = weeklyPay / WORK_DAYS_PER_WEEK;

  const rawWeeks = weeksPerYear * yearsOfService;
  const weeksGranted = capWeeks > 0 ? Math.min(rawWeeks, capWeeks) : rawWeeks;

  const basePay = weeklyPay * weeksGranted;
  const ptoPayout = dailyPay * unusedPtoDays;
  const totalSeverance = basePay + ptoPayout + bonus;

  // Build a tenure schedule (whole years up to the rounded total tenure) so the
  // package can be charted against length of service.
  const schedule: SeveranceTenurePoint[] = [{ year: 0, weeks: 0, payout: 0 }];
  const endYear = Math.max(1, Math.ceil(yearsOfService));
  for (let yr = 1; yr <= endYear; yr++) {
    const tenure = Math.min(yr, yearsOfService);
    const raw = weeksPerYear * tenure;
    const weeks = capWeeks > 0 ? Math.min(raw, capWeeks) : raw;
    schedule.push({ year: tenure, weeks, payout: weeklyPay * weeks });
  }

  return {
    weeklyPay,
    dailyPay,
    weeksGranted,
    basePay,
    ptoPayout,
    bonus,
    totalSeverance,
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
