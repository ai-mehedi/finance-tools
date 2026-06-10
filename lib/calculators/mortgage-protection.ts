// Pure logic for the Mortgage Protection Calculator.
// Estimates the life-insurance coverage needed to clear a mortgage if the
// borrower dies, and gives a rough monthly premium. It also models the
// outstanding mortgage balance over time so you can see how the coverage gap
// shrinks as the loan amortizes (the basis of decreasing-term MPI policies).

export type CoverageType = "level" | "decreasing";

export interface MortgageProtectionInput {
  balance: number; // current mortgage balance
  annualRatePct: number; // mortgage interest rate
  termYears: number; // remaining mortgage term
  age: number; // applicant age (drives the premium estimate)
  smoker: boolean;
  coverageType: CoverageType; // level term or decreasing term
}

export interface ProtectionYearPoint {
  year: number;
  mortgageBalance: number; // outstanding mortgage that year
  coverage: number; // policy payout that year
}

export interface MortgageProtectionResult {
  recommendedCoverage: number; // payout needed at the start
  monthlyMortgagePayment: number;
  estimatedMonthlyPremium: number;
  estimatedAnnualPremium: number;
  totalPremiumOverTerm: number;
  ratePer1000: number; // monthly premium per $1,000 of cover
  schedule: ProtectionYearPoint[];
}

function monthlyPayment(principal: number, ratePct: number, n: number): number {
  const r = ratePct / 100 / 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

// Outstanding balance after k payments of a fully amortizing loan.
function balanceAfter(principal: number, ratePct: number, n: number, k: number): number {
  const r = ratePct / 100 / 12;
  if (k <= 0) return principal;
  if (k >= n) return 0;
  if (r === 0) return Math.max(principal - (principal / n) * k, 0);
  const pmt = monthlyPayment(principal, ratePct, n);
  const fk = Math.pow(1 + r, k);
  const bal = principal * fk - pmt * ((fk - 1) / r);
  return Math.max(bal, 0);
}

export function computeMortgageProtection(
  input: MortgageProtectionInput,
): MortgageProtectionResult | null {
  const { balance, annualRatePct, termYears, age, smoker, coverageType } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(age) || age < 18 || age > 75) return null;

  const n = Math.round(termYears * 12);
  const monthlyMortgagePayment = monthlyPayment(balance, annualRatePct, n);
  const recommendedCoverage = balance;

  // Simple actuarial-style premium model (illustrative, not a real quote).
  // Base monthly cost per $1,000 of level cover rises with age and term, and
  // is higher for smokers. Decreasing term costs less because exposure falls.
  const ageFactor = 0.09 + Math.max(age - 30, 0) * 0.012 + Math.max(age - 50, 0) * 0.02;
  const termFactor = 1 + Math.max(termYears - 20, 0) * 0.01;
  const smokerFactor = smoker ? 1.6 : 1;
  const typeFactor = coverageType === "decreasing" ? 0.6 : 1;

  const ratePer1000 = ageFactor * termFactor * smokerFactor * typeFactor;
  const estimatedMonthlyPremium = (recommendedCoverage / 1000) * ratePer1000;
  const estimatedAnnualPremium = estimatedMonthlyPremium * 12;
  const totalPremiumOverTerm = estimatedMonthlyPremium * n;

  const years = Math.ceil(termYears);
  const schedule: ProtectionYearPoint[] = [];
  for (let yr = 0; yr <= years; yr++) {
    const k = Math.min(yr * 12, n);
    const mortgageBalance = balanceAfter(balance, annualRatePct, n, k);
    const coverage = coverageType === "level" ? recommendedCoverage : mortgageBalance;
    schedule.push({ year: yr, mortgageBalance, coverage });
  }

  return {
    recommendedCoverage,
    monthlyMortgagePayment,
    estimatedMonthlyPremium,
    estimatedAnnualPremium,
    totalPremiumOverTerm,
    ratePer1000,
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
