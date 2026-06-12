// Pure logic for the STP (Systematic Transfer Plan) Calculator.
// In an STP a lump sum is parked in a source fund (typically a lower-return debt
// or liquid fund) and a fixed amount is transferred every month into a target
// fund (typically a higher-return equity fund). Both sleeves keep compounding on
// what is left or added. We simulate month by month and expose a per-year
// schedule so the chart can show both balances and the combined total.

export interface StpInput {
  sourceLumpSum: number; // amount parked in the source fund at the start
  monthlyTransfer: number; // amount moved into the target fund each month
  sourceRatePct: number; // annual return of the source fund
  targetRatePct: number; // annual return of the target fund
  years: number;
}

export interface StpYearPoint {
  year: number;
  source: number; // source-fund balance at end of year
  target: number; // target-fund balance at end of year
  total: number; // source plus target
  transferred: number; // cumulative amount moved into the target fund
}

export interface StpResult {
  sourceBalance: number;
  targetBalance: number;
  totalValue: number;
  totalTransferred: number;
  totalGains: number; // total value minus the original lump sum
  transfersStoppedMonth: number | null; // month the source ran dry, or null
  schedule: StpYearPoint[];
}

export function computeStp(input: StpInput): StpResult | null {
  const { sourceLumpSum, monthlyTransfer, sourceRatePct, targetRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (sourceLumpSum <= 0 || monthlyTransfer < 0) return null;
  if (!Number.isFinite(sourceRatePct) || sourceRatePct < 0) return null;
  if (!Number.isFinite(targetRatePct) || targetRatePct < 0) return null;

  const srcMonthly = sourceRatePct / 100 / 12;
  const tgtMonthly = targetRatePct / 100 / 12;
  const months = Math.round(years * 12);

  let source = sourceLumpSum;
  let target = 0;
  let totalTransferred = 0;
  let transfersStoppedMonth: number | null = null;

  const schedule: StpYearPoint[] = [
    { year: 0, source: sourceLumpSum, target: 0, total: sourceLumpSum, transferred: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    // Both sleeves earn their return for the month first.
    source *= 1 + srcMonthly;
    target *= 1 + tgtMonthly;

    // Then move this month's transfer, capped by what the source still holds.
    const move = Math.min(monthlyTransfer, source);
    source -= move;
    target += move;
    totalTransferred += move;
    if (move < monthlyTransfer && transfersStoppedMonth === null) {
      transfersStoppedMonth = m;
    }

    if (m % 12 === 0) {
      schedule.push({
        year: m / 12,
        source,
        target,
        total: source + target,
        transferred: totalTransferred,
      });
    }
  }

  if (months % 12 !== 0) {
    schedule.push({
      year: months / 12,
      source,
      target,
      total: source + target,
      transferred: totalTransferred,
    });
  }

  const sourceBalance = source;
  const targetBalance = target;
  const totalValue = source + target;
  const totalGains = totalValue - sourceLumpSum;

  return {
    sourceBalance,
    targetBalance,
    totalValue,
    totalTransferred,
    totalGains,
    transfersStoppedMonth,
    schedule,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
