// Pure logic for the Annuity Calculator (accumulation / future value).
// Computes the future value of a starting balance plus regular contributions
// growing at a fixed rate, and exposes a per-year schedule for charting.
// Future value of an ordinary annuity: FV = PMT * ((1 + i)^n - 1) / i,
// with the starting balance compounded separately as P * (1 + i)^n.

export type Timing = "end" | "begin";

export interface AnnuityInput {
  startingBalance: number;
  monthlyContribution: number;
  annualRatePct: number;
  years: number;
  timing: Timing; // contributions at end (ordinary) or begin (annuity due)
}

export interface AnnuityYearPoint {
  year: number;
  balance: number;
  /** Starting balance + all contributions made so far. */
  contributed: number;
  /** Balance minus contributed = interest earned so far. */
  interest: number;
}

export interface AnnuityResult {
  futureValue: number;
  totalContributions: number; // excludes the starting balance
  totalInterest: number;
  schedule: AnnuityYearPoint[]; // one point per year, starting at year 0
}

export function computeAnnuity(input: AnnuityInput): AnnuityResult | null {
  const { startingBalance, monthlyContribution, annualRatePct, years, timing } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (startingBalance < 0 || annualRatePct < 0 || monthlyContribution < 0) return null;

  const i = annualRatePct / 100 / 12; // monthly rate
  const months = Math.round(years * 12);
  let balance = startingBalance;

  const schedule: AnnuityYearPoint[] = [
    { year: 0, balance: startingBalance, contributed: startingBalance, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    if (timing === "begin") {
      // Annuity due: contribution added before interest is applied.
      balance = (balance + monthlyContribution) * (1 + i);
    } else {
      // Ordinary annuity: interest first, then the contribution.
      balance = balance * (1 + i) + monthlyContribution;
    }
    if (m % 12 === 0) {
      const contributed = startingBalance + monthlyContribution * m;
      schedule.push({
        year: m / 12,
        balance,
        contributed,
        interest: balance - contributed,
      });
    }
  }

  const totalContributions = monthlyContribution * months;
  const futureValue = balance;
  const totalInterest = futureValue - startingBalance - totalContributions;

  return { futureValue, totalContributions, totalInterest, schedule };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

/** Compact axis labels like $1.2k / $3.4M. */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
