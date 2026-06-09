// Pure logic for the Latte Factor Calculator.
// Models a small recurring daily expense redirected into an investment that
// compounds monthly, so you can see what a daily habit could grow to over time.

export interface LatteFactorInput {
  dailyAmount: number; // cost of the daily habit
  daysPerWeek: number; // how many days per week you spend it
  annualReturnPct: number; // assumed annual investment return
  years: number;
}

export interface LatteYearPoint {
  year: number;
  balance: number;
  /** Total cash you actually redirected by the end of this year. */
  contributed: number;
  /** Balance minus contributed = growth earned so far. */
  interest: number;
}

export interface LatteFactorResult {
  monthlySaved: number;
  totalContributions: number;
  totalInterest: number;
  futureValue: number;
  schedule: LatteYearPoint[];
}

export function computeLatteFactor(input: LatteFactorInput): LatteFactorResult | null {
  const { dailyAmount, daysPerWeek, annualReturnPct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (dailyAmount < 0 || annualReturnPct < 0) return null;
  if (!Number.isFinite(daysPerWeek) || daysPerWeek < 0 || daysPerWeek > 7) return null;

  // Average a month at 52 weeks / 12 months to turn a daily habit into a monthly figure.
  const monthlySaved = dailyAmount * daysPerWeek * 52 / 12;
  const monthlyRate = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;

  const months = Math.round(years * 12);
  let balance = 0;

  const schedule: LatteYearPoint[] = [
    { year: 0, balance: 0, contributed: 0, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlySaved;
    if (m % 12 === 0) {
      const contributed = monthlySaved * m;
      schedule.push({
        year: m / 12,
        balance,
        contributed,
        interest: balance - contributed,
      });
    }
  }

  const totalContributions = monthlySaved * months;
  const futureValue = balance;
  const totalInterest = futureValue - totalContributions;

  return { monthlySaved, totalContributions, totalInterest, futureValue, schedule };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
