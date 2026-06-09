// Pure logic for the 529 Plan Calculator.
// Projects the future value of a 529 college savings account given a starting
// balance, monthly contributions and an expected annual return, compounded
// monthly. Exposes a per-year schedule for charting the balance and contributions.

export interface Five29PlanInput {
  currentSavings: number; // starting balance
  monthlyContribution: number;
  annualReturnPct: number; // expected return, % / yr
  years: number; // years until college (or end of saving)
}

export interface Five29YearPoint {
  year: number;
  balance: number;
  contributed: number; // starting balance + contributions so far
  earnings: number; // balance minus contributed
}

export interface Five29PlanResult {
  futureValue: number;
  totalContributions: number; // excludes the starting balance
  totalEarnings: number;
  schedule: Five29YearPoint[];
}

export function computeFive29Plan(input: Five29PlanInput): Five29PlanResult | null {
  const { currentSavings, monthlyContribution, annualReturnPct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (currentSavings < 0 || monthlyContribution < 0 || annualReturnPct < 0) return null;
  if (!Number.isFinite(currentSavings) || !Number.isFinite(monthlyContribution)) return null;

  const monthlyRate = annualReturnPct / 100 / 12;
  const months = Math.round(years * 12);
  let balance = currentSavings;

  const schedule: Five29YearPoint[] = [
    { year: 0, balance: currentSavings, contributed: currentSavings, earnings: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (m % 12 === 0) {
      const contributed = currentSavings + monthlyContribution * m;
      schedule.push({
        year: m / 12,
        balance,
        contributed,
        earnings: balance - contributed,
      });
    }
  }

  const totalContributions = monthlyContribution * months;
  const futureValue = balance;
  const totalEarnings = futureValue - currentSavings - totalContributions;

  return { futureValue, totalContributions, totalEarnings, schedule };
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
