// Pure logic for the Percentage Change Calculator.
// Percentage change from an old value to a new value:
//   change% = ((new - old) / |old|) * 100
// Distinguishes increase from decrease, reports the absolute difference, and
// exposes a tiny two-bar schedule (old vs new) for an inline bar chart.

export interface PercentageChangeInput {
  oldValue: number;
  newValue: number;
}

export interface PercentageChangeBar {
  label: string;
  value: number;
}

export interface PercentageChangeResult {
  changePercent: number; // signed: positive = increase, negative = decrease
  difference: number; // newValue - oldValue
  direction: "increase" | "decrease" | "no change";
  oldValue: number;
  newValue: number;
  bars: PercentageChangeBar[];
}

export function computePercentageChange(
  input: PercentageChangeInput
): PercentageChangeResult | null {
  const { oldValue, newValue } = input;
  if (!Number.isFinite(oldValue) || !Number.isFinite(newValue)) return null;
  if (oldValue === 0) return null; // change is undefined when starting from zero

  const difference = newValue - oldValue;
  const changePercent = (difference / Math.abs(oldValue)) * 100;

  const direction: PercentageChangeResult["direction"] =
    difference > 0 ? "increase" : difference < 0 ? "decrease" : "no change";

  return {
    changePercent,
    difference,
    direction,
    oldValue,
    newValue,
    bars: [
      { label: "Old", value: oldValue },
      { label: "New", value: newValue },
    ],
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  const rounded = Math.round(n * 100) / 100;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
