// Pure logic for the Allowance Calculator.
// Projects how a regular kids' or teen allowance adds up over time, including
// the portion that is set aside as savings and a simple interest boost on the
// saved balance. Builds a per-year schedule for charting the growing pot.

export type Period = "weekly" | "biweekly" | "monthly";

export const PERIODS_PER_YEAR: Record<Period, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export interface AllowanceInput {
  amountPerPeriod: number;
  period: Period;
  years: number;
  savePct: number; // percent of each allowance that is saved
  annualRatePct: number; // interest on the saved balance
}

export interface AllowanceYearPoint {
  year: number;
  savedBalance: number; // saved money plus interest
  totalAllowance: number; // all allowance paid out so far
}

export interface AllowanceResult {
  perYearAllowance: number;
  totalAllowance: number;
  totalSaved: number; // money set aside, before interest
  interestEarned: number;
  savedBalance: number; // total saved plus interest
  spendingMoney: number; // allowance not saved
  schedule: AllowanceYearPoint[];
}

export function computeAllowance(input: AllowanceInput): AllowanceResult | null {
  const { amountPerPeriod, period, years, savePct, annualRatePct } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (amountPerPeriod < 0 || savePct < 0 || savePct > 100 || annualRatePct < 0) return null;

  const perYear = PERIODS_PER_YEAR[period];
  const perYearAllowance = amountPerPeriod * perYear;
  const savedPerPeriod = amountPerPeriod * (savePct / 100);
  const monthlyRate = annualRatePct / 100 / 12;

  // Simulate month by month so interest compounds on the saved balance.
  const months = Math.round(years * 12);
  // Spread each period's saving into the months it falls in by using a
  // monthly saving equivalent. perYear contributions per year over 12 months.
  const savedPerMonth = (savedPerPeriod * perYear) / 12;

  let savedBalance = 0;
  const schedule: AllowanceYearPoint[] = [
    { year: 0, savedBalance: 0, totalAllowance: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    savedBalance = savedBalance * (1 + monthlyRate) + savedPerMonth;
    if (m % 12 === 0) {
      schedule.push({
        year: m / 12,
        savedBalance,
        totalAllowance: (perYearAllowance * m) / 12,
      });
    }
  }

  const totalAllowance = perYearAllowance * years;
  const totalSaved = savedPerMonth * months;
  const interestEarned = savedBalance - totalSaved;
  const spendingMoney = totalAllowance - totalSaved;

  return {
    perYearAllowance,
    totalAllowance,
    totalSaved,
    interestEarned,
    savedBalance,
    spendingMoney,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number): string => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
