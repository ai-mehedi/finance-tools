// Pure logic for the Mutual Fund Returns Calculator.
// Handles two investment styles: a one-time lump sum and a monthly SIP
// (systematic investment plan). Returns are compounded monthly from the
// expected annual return, with an optional expense ratio that drags on growth.
// Exposes a per-year schedule for charting invested vs. value.

export type InvestMode = "sip" | "lumpsum";

export interface MutualFundInput {
  mode: InvestMode;
  monthlyInvestment: number; // used when mode is "sip"
  lumpSum: number; // used when mode is "lumpsum"
  expectedReturnPct: number; // expected annual return before fees
  expenseRatioPct: number; // annual expense ratio that reduces net return
  years: number;
}

export interface MutualFundYearPoint {
  year: number;
  value: number;
  invested: number;
  gain: number; // value minus invested
}

export interface MutualFundResult {
  futureValue: number;
  totalInvested: number;
  estimatedGain: number;
  netReturnPct: number; // annual return after deducting the expense ratio
  schedule: MutualFundYearPoint[];
}

export function computeMutualFund(input: MutualFundInput): MutualFundResult | null {
  const { mode, monthlyInvestment, lumpSum, expectedReturnPct, expenseRatioPct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(expectedReturnPct)) return null;
  if (monthlyInvestment < 0 || lumpSum < 0 || expenseRatioPct < 0) return null;

  const netReturnPct = expectedReturnPct - expenseRatioPct;
  const monthlyRate = netReturnPct / 100 / 12;
  const months = Math.round(years * 12);

  let value = mode === "lumpsum" ? lumpSum : 0;
  const sip = mode === "sip" ? monthlyInvestment : 0;

  const schedule: MutualFundYearPoint[] = [
    { year: 0, value, invested: value, gain: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    // Contributions are invested at the start of the month, then grow.
    value = (value + sip) * (1 + monthlyRate);
    if (m % 12 === 0) {
      const invested = (mode === "lumpsum" ? lumpSum : 0) + sip * m;
      schedule.push({ year: m / 12, value, invested, gain: value - invested });
    }
  }

  const totalInvested = (mode === "lumpsum" ? lumpSum : 0) + sip * months;
  const futureValue = value;
  const estimatedGain = futureValue - totalInvested;

  return { futureValue, totalInvested, estimatedGain, netReturnPct, schedule };
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
