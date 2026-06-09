// Pure logic for the 401(k) Calculator.
// Simulates contributions month-by-month: your contribution is a percent of
// salary, and the employer matches your contribution dollar-for-dollar up to a
// capped percent of salary. The balance grows at the monthly equivalent of the
// expected annual return, and a per-year schedule is exposed for charting.

export interface Four01kInput {
  currentBalance: number;
  annualSalary: number;
  /** Your contribution as a percent of salary, e.g. 6 means 6%. */
  contributionPct: number;
  /** Employer match rate as a percent of the matched portion, e.g. 100 = full match, 50 = 50 cents on the dollar. */
  employerMatchPct: number;
  /** Employer only matches your contributions up to this percent of salary. */
  matchLimitPct: number;
  annualReturnPct: number;
  years: number;
}

export interface Four01kYearPoint {
  year: number;
  balance: number;
  /** Starting balance + your contributions + employer contributions so far. */
  contributed: number;
  /** Balance minus contributed = investment growth so far. */
  growth: number;
}

export interface Four01kResult {
  futureBalance: number;
  yourContributions: number;
  employerContributions: number;
  totalGrowth: number;
  schedule: Four01kYearPoint[]; // one point per year, starting at year 0
}

export function computeFour01k(input: Four01kInput): Four01kResult | null {
  const {
    currentBalance,
    annualSalary,
    contributionPct,
    employerMatchPct,
    matchLimitPct,
    annualReturnPct,
    years,
  } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (currentBalance < 0 || annualSalary < 0) return null;
  if (contributionPct < 0 || employerMatchPct < 0 || matchLimitPct < 0) return null;
  if (annualReturnPct < 0) return null;
  if (
    !Number.isFinite(currentBalance) ||
    !Number.isFinite(annualSalary) ||
    !Number.isFinite(contributionPct) ||
    !Number.isFinite(employerMatchPct) ||
    !Number.isFinite(matchLimitPct) ||
    !Number.isFinite(annualReturnPct)
  ) {
    return null;
  }

  const monthlyReturn = annualReturnPct / 100 / 12;
  const months = Math.round(years * 12);

  // Your contribution as a fraction of monthly salary.
  const monthlySalary = annualSalary / 12;
  const yourMonthly = monthlySalary * (contributionPct / 100);

  // Employer matches the portion of your contribution up to the limit, at the
  // employer match rate. The matched fraction of salary is capped at matchLimit.
  const matchedPct = Math.min(contributionPct, matchLimitPct);
  const employerMonthly = monthlySalary * (matchedPct / 100) * (employerMatchPct / 100);

  let balance = currentBalance;
  let yourContributions = 0;
  let employerContributions = 0;

  const schedule: Four01kYearPoint[] = [
    { year: 0, balance: currentBalance, contributed: currentBalance, growth: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    // Grow first, then add this month's contributions.
    balance = balance * (1 + monthlyReturn) + yourMonthly + employerMonthly;
    yourContributions += yourMonthly;
    employerContributions += employerMonthly;

    if (m % 12 === 0) {
      const contributed = currentBalance + yourContributions + employerContributions;
      schedule.push({
        year: m / 12,
        balance,
        contributed,
        growth: balance - contributed,
      });
    }
  }

  const futureBalance = balance;
  const totalGrowth =
    futureBalance - currentBalance - yourContributions - employerContributions;

  return {
    futureBalance,
    yourContributions,
    employerContributions,
    totalGrowth,
    schedule,
  };
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
