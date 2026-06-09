// Pure logic for the 401k Match Calculator.
// Works out how much an employer matches based on a percentage of salary the
// employee contributes, capped at a stated percentage of pay, plus the combined
// annual total that lands in the account.

export interface Four01kMatchInput {
  annualSalary: number;
  contributionPct: number; // employee deferral, % of salary
  matchRatePct: number; // employer matches this % of each dollar (e.g. 50 = 50 cents on the dollar)
  matchLimitPct: number; // match applies only up to this % of salary
}

export interface Four01kMatchResult {
  employeeAnnual: number;
  employerAnnual: number;
  totalAnnual: number;
  freeMoneyMissed: number; // employer money left on the table by not maxing the match
  matchedSalaryPct: number; // share of salary that actually earned a match
}

export function computeFour01kMatch(input: Four01kMatchInput): Four01kMatchResult | null {
  const { annualSalary, contributionPct, matchRatePct, matchLimitPct } = input;

  if (!Number.isFinite(annualSalary) || annualSalary <= 0) return null;
  if (contributionPct < 0 || matchRatePct < 0 || matchLimitPct < 0) return null;
  if (!Number.isFinite(contributionPct) || !Number.isFinite(matchRatePct) || !Number.isFinite(matchLimitPct)) {
    return null;
  }

  const employeeAnnual = annualSalary * (contributionPct / 100);

  // Employer matches matchRatePct of every dollar the employee defers, but only
  // on contributions up to matchLimitPct of salary.
  const matchedSalaryPct = Math.min(contributionPct, matchLimitPct);
  const matchedDollars = annualSalary * (matchedSalaryPct / 100);
  const employerAnnual = matchedDollars * (matchRatePct / 100);

  // What the employer would add if the employee contributed at least to the cap.
  const fullMatchDollars = annualSalary * (matchLimitPct / 100);
  const fullEmployerMatch = fullMatchDollars * (matchRatePct / 100);
  const freeMoneyMissed = Math.max(0, fullEmployerMatch - employerAnnual);

  const totalAnnual = employeeAnnual + employerAnnual;

  return {
    employeeAnnual,
    employerAnnual,
    totalAnnual,
    freeMoneyMissed,
    matchedSalaryPct,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
