// Pure logic for the Expense Ratio Calculator.
// Estimates how much a fund's annual expense ratio costs you over time and how
// much larger your balance would be with a lower (or zero) fee. The fee is
// applied to the balance each year so the drag compounds, and a per-year
// schedule is produced for charting the gap between gross and net growth.

export interface ExpenseRatioInput {
  initial: number;
  annualContribution: number;
  annualReturnPct: number; // expected gross annual return before fees
  expenseRatioPct: number; // fund's annual expense ratio
  years: number;
}

export interface ExpenseRatioYearPoint {
  year: number;
  withFee: number; // balance after the expense ratio is applied
  withoutFee: number; // balance with no fee for comparison
  feesPaid: number; // cumulative fees paid by end of year
}

export interface ExpenseRatioResult {
  finalWithFee: number;
  finalWithoutFee: number;
  totalFees: number; // cumulative dollars lost to the expense ratio
  lostGrowth: number; // difference in ending balance (fees plus forgone compounding)
  firstYearFee: number; // dollar cost of the fee in year one
  schedule: ExpenseRatioYearPoint[];
}

export function computeExpenseRatio(input: ExpenseRatioInput): ExpenseRatioResult | null {
  const { initial, annualContribution, annualReturnPct, expenseRatioPct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (initial < 0 || annualContribution < 0) return null;
  if (!Number.isFinite(annualReturnPct) || !Number.isFinite(expenseRatioPct)) return null;
  if (expenseRatioPct < 0) return null;

  const grossRate = annualReturnPct / 100;
  const feeRate = expenseRatioPct / 100;
  const netRate = grossRate - feeRate;

  const n = Math.round(years);

  let withFee = initial;
  let withoutFee = initial;
  let cumFees = 0;
  let firstYearFee = 0;

  const schedule: ExpenseRatioYearPoint[] = [
    { year: 0, withFee: initial, withoutFee: initial, feesPaid: 0 },
  ];

  for (let y = 1; y <= n; y++) {
    // Grow with contributions, then charge the expense ratio on the balance.
    const grownWithFee = withFee * (1 + grossRate) + annualContribution;
    const fee = grownWithFee * feeRate;
    withFee = grownWithFee - fee;
    cumFees += fee;
    if (y === 1) firstYearFee = fee;

    withoutFee = withoutFee * (1 + grossRate) + annualContribution;

    schedule.push({ year: y, withFee, withoutFee, feesPaid: cumFees });
  }

  return {
    finalWithFee: withFee,
    finalWithoutFee: withoutFee,
    totalFees: cumFees,
    lostGrowth: withoutFee - withFee,
    firstYearFee,
    schedule,
  };
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
