// Pure logic for the FIRE Calculator (Financial Independence, Retire Early).
// Two questions: (1) the FIRE number = annual spending divided by the safe
// withdrawal rate, and (2) how many years of saving and investing it takes to
// reach that number from a current portfolio. Simulates year by year on real
// (inflation-adjusted) returns so the projection is in today's dollars, and
// exposes a per-year schedule for charting the path to independence.

export interface FireInput {
  currentAge: number;
  currentSavings: number;
  annualContribution: number;
  annualExpenses: number; // expected spending in retirement, today's dollars
  realReturnPct: number; // expected return after inflation
  withdrawalRatePct: number; // safe withdrawal rate, e.g. 4
}

export interface FireYearPoint {
  year: number; // years from now
  age: number;
  portfolio: number;
}

export interface FireResult {
  fireNumber: number;
  yearsToFire: number | null; // null if not reached within horizon
  fireAge: number | null;
  monthlyPassiveIncome: number; // safe income the FIRE number supports
  reachedAtStart: boolean;
  schedule: FireYearPoint[];
}

const MAX_YEARS = 70;

export function computeFire(input: FireInput): FireResult | null {
  const {
    currentAge,
    currentSavings,
    annualContribution,
    annualExpenses,
    realReturnPct,
    withdrawalRatePct,
  } = input;

  if (!Number.isFinite(annualExpenses) || annualExpenses <= 0) return null;
  if (!Number.isFinite(withdrawalRatePct) || withdrawalRatePct <= 0) return null;
  if (!Number.isFinite(realReturnPct)) return null;
  if (currentSavings < 0 || annualContribution < 0) return null;

  const swr = withdrawalRatePct / 100;
  const r = realReturnPct / 100;
  const fireNumber = annualExpenses / swr;
  const monthlyPassiveIncome = (fireNumber * swr) / 12;

  const age0 = Number.isFinite(currentAge) ? currentAge : 0;

  const schedule: FireYearPoint[] = [
    { year: 0, age: age0, portfolio: currentSavings },
  ];

  if (currentSavings >= fireNumber) {
    return {
      fireNumber,
      yearsToFire: 0,
      fireAge: age0,
      monthlyPassiveIncome,
      reachedAtStart: true,
      schedule,
    };
  }

  let portfolio = currentSavings;
  let yearsToFire: number | null = null;

  for (let y = 1; y <= MAX_YEARS; y++) {
    // Contribution added through the year, then growth on the balance.
    portfolio = portfolio * (1 + r) + annualContribution;
    schedule.push({ year: y, age: age0 + y, portfolio });
    if (yearsToFire === null && portfolio >= fireNumber) {
      yearsToFire = y;
      // Keep a few years past FIRE for chart context, then stop.
      if (schedule.length > y + 1) break;
      break;
    }
  }

  return {
    fireNumber,
    yearsToFire,
    fireAge: yearsToFire === null ? null : age0 + yearsToFire,
    monthlyPassiveIncome,
    reachedAtStart: false,
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
