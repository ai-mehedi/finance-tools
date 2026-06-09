// Pure logic for the Certificate of Deposit (CD) Calculator.
// A CD pays a fixed APY for a set term. Interest compounds at a chosen
// frequency. We simulate month by month to expose a per-year schedule
// for charting the growing balance.

export type CompoundFrequency =
  | "daily"
  | "monthly"
  | "quarterly"
  | "semiannually"
  | "annually";

export const FREQ_PER_YEAR: Record<CompoundFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  semiannually: 2,
  annually: 1,
};

export interface CDInput {
  principal: number;
  annualRatePct: number; // nominal annual rate
  months: number; // term length in months
  frequency: CompoundFrequency;
}

export interface CDYearPoint {
  year: number;
  balance: number;
}

export interface CDResult {
  maturityValue: number;
  totalInterest: number;
  apyPct: number; // effective annual yield
  schedule: CDYearPoint[];
}

export function computeCD(input: CDInput): CDResult | null {
  const { principal, annualRatePct, months, frequency } = input;

  if (!Number.isFinite(principal) || principal < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(months) || months <= 0) return null;

  const n = FREQ_PER_YEAR[frequency];
  const r = annualRatePct / 100;
  const apyPct = (Math.pow(1 + r / n, n) - 1) * 100;
  // Equivalent monthly growth factor for the same nominal rate.
  const monthlyFactor = Math.pow(1 + r / n, n / 12);

  const totalMonths = Math.round(months);
  let balance = principal;

  const schedule: CDYearPoint[] = [{ year: 0, balance: principal }];
  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * monthlyFactor;
    if (m % 12 === 0 || m === totalMonths) {
      schedule.push({ year: m / 12, balance });
    }
  }

  const maturityValue = balance;
  const totalInterest = maturityValue - principal;

  return { maturityValue, totalInterest, apyPct, schedule };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
