// Pure logic for the Rule of 72 Calculator.
// The Rule of 72 is a mental-math shortcut: divide 72 by the annual rate of
// return (as a whole-number percent) to estimate the years it takes money to
// double. This tool reports that estimate, the exact doubling time from the
// real compound-interest formula, and a doublings schedule for charting.

export type SolveFor = "years" | "rate";

export interface RuleOf72Input {
  solveFor: SolveFor;
  // When solving for years, ratePct is required. When solving for rate, years is required.
  ratePct: number;
  years: number;
  principal: number; // starting amount, used only to label the chart
}

export interface RuleOf72DoublingPoint {
  doublings: number; // 0, 1, 2, ...
  years: number; // exact years to reach this many doublings
  value: number; // principal times 2^doublings
}

export interface RuleOf72Result {
  solveFor: SolveFor;
  rulePct: number; // the rate used (input or solved)
  ruleYears: number; // the Rule-of-72 estimate
  exactYears: number; // exact doubling time at the rate
  exactRatePct: number; // exact rate that doubles in the given years
  schedule: RuleOf72DoublingPoint[];
}

export function computeRuleOf72(input: RuleOf72Input): RuleOf72Result | null {
  const { solveFor, ratePct, years, principal } = input;
  const p = Number.isFinite(principal) && principal > 0 ? principal : 1;

  let rulePct: number;
  let ruleYears: number;
  let exactYears: number;
  let exactRatePct: number;

  if (solveFor === "years") {
    if (!Number.isFinite(ratePct) || ratePct <= 0) return null;
    rulePct = ratePct;
    ruleYears = 72 / ratePct;
    // Exact: ln(2) / ln(1 + r)
    exactYears = Math.log(2) / Math.log(1 + ratePct / 100);
    exactRatePct = ratePct;
  } else {
    if (!Number.isFinite(years) || years <= 0) return null;
    ruleYears = years;
    rulePct = 72 / years;
    // Exact rate that doubles money in the given number of years.
    exactRatePct = (Math.pow(2, 1 / years) - 1) * 100;
    exactYears = years;
  }

  // Build a doublings schedule using the exact doubling time at the chosen rate.
  const doublingTime =
    solveFor === "years"
      ? exactYears
      : Math.log(2) / Math.log(1 + exactRatePct / 100);

  const schedule: RuleOf72DoublingPoint[] = [];
  for (let d = 0; d <= 5; d++) {
    schedule.push({
      doublings: d,
      years: doublingTime * d,
      value: p * Math.pow(2, d),
    });
  }

  return { solveFor, rulePct, ruleYears, exactYears, exactRatePct, schedule };
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

export const formatYears = (n: number) =>
  !Number.isFinite(n) ? "—" : `${n.toFixed(1)} yr`;
