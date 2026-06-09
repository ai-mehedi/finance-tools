// Pure logic for the Annuity Payout Calculator (drawdown phase).
// Given a starting balance that keeps earning interest, this finds the level
// monthly payout that exhausts the balance over a fixed number of years, using
// the present value of an annuity formula:
// PMT = P * i / (1 - (1 + i)^-n), with i the monthly rate and n the months.
// It also builds a per-year schedule of the falling balance for charting.

export interface AnnuityPayoutInput {
  startingBalance: number;
  annualRatePct: number;
  years: number;
}

export interface PayoutYearPoint {
  year: number;
  balance: number; // remaining balance at end of year
  paidOut: number; // cumulative payouts by end of year
  interestEarned: number; // cumulative interest credited by end of year
}

export interface AnnuityPayoutResult {
  monthlyPayout: number;
  annualPayout: number;
  totalPaidOut: number;
  totalInterest: number;
  schedule: PayoutYearPoint[]; // one point per year, starting at year 0
}

export function computeAnnuityPayout(
  input: AnnuityPayoutInput,
): AnnuityPayoutResult | null {
  const { startingBalance, annualRatePct, years } = input;

  if (!Number.isFinite(startingBalance) || startingBalance <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (annualRatePct < 0) return null;

  const i = annualRatePct / 100 / 12;
  const n = Math.round(years * 12);

  const monthlyPayout =
    i > 0
      ? (startingBalance * i) / (1 - Math.pow(1 + i, -n))
      : startingBalance / n;

  let balance = startingBalance;
  let cumPaid = 0;
  let cumInterest = 0;

  const schedule: PayoutYearPoint[] = [
    { year: 0, balance: startingBalance, paidOut: 0, interestEarned: 0 },
  ];

  for (let m = 1; m <= n; m++) {
    const interest = balance * i;
    let payout = monthlyPayout;
    // Final payment guard so the balance lands exactly on zero.
    if (payout > balance + interest) payout = balance + interest;
    balance = Math.max(0, balance + interest - payout);
    cumInterest += interest;
    cumPaid += payout;
    if (m % 12 === 0 || m === n) {
      schedule.push({
        year: m / 12,
        balance,
        paidOut: cumPaid,
        interestEarned: cumInterest,
      });
    }
  }

  return {
    monthlyPayout,
    annualPayout: monthlyPayout * 12,
    totalPaidOut: cumPaid,
    totalInterest: cumInterest,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD0 = (n: number) => usd0.format(Number.isFinite(n) ? n : 0);

/** Compact axis labels like $1.2k / $3.4M. */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
