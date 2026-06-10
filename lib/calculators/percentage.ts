// Pure logic for the Percentage Calculator.
// Solves the three classic percentage questions in one place:
//   1. What is P% of a number?            ->  value = (P / 100) * X
//   2. A is what percent of B?            ->  percent = (A / B) * 100
//   3. Increase/decrease X by P%          ->  result = X * (1 +/- P/100)
// Returns a small breakdown plus a per-segment array used to draw a donut.

export type PercentMode = "ofValue" | "isWhatPercent" | "changeByPercent";

export interface PercentageInput {
  mode: PercentMode;
  // For "ofValue": percent of base
  percent: number;
  base: number;
  // For "isWhatPercent": part of whole
  part: number;
  whole: number;
  // For "changeByPercent": start value and a signed percent change
  start: number;
  changePercent: number;
}

export interface DonutSegment {
  label: string;
  value: number; // share in 0..1 used to size the arc
  color: string;
}

export interface PercentageResult {
  headline: number; // the main answer in the units that fit the mode
  caption: string; // short human description of the headline number
  rows: { label: string; value: string }[];
  donut: DonutSegment[];
}

const ORANGE = "#f97316";
const AMBER = "#fb923c";
const ZINC = "#d4d4d8";

export function computePercentage(input: PercentageInput): PercentageResult | null {
  const { mode } = input;

  if (mode === "ofValue") {
    const { percent, base } = input;
    if (!Number.isFinite(percent) || !Number.isFinite(base)) return null;
    const headline = (percent / 100) * base;
    return {
      headline,
      caption: `${trim(percent)}% of ${trim(base)}`,
      rows: [
        { label: "Percent", value: `${trim(percent)}%` },
        { label: "Base amount", value: trim(base) },
        { label: "Result", value: trim(headline) },
        { label: "Remaining", value: trim(base - headline) },
      ],
      donut: [
        { label: `${trim(percent)}%`, value: clamp01(percent / 100), color: ORANGE },
        { label: "Rest", value: clamp01(1 - percent / 100), color: ZINC },
      ],
    };
  }

  if (mode === "isWhatPercent") {
    const { part, whole } = input;
    if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return null;
    const headline = (part / whole) * 100;
    return {
      headline,
      caption: `${trim(part)} is ${trim(headline)}% of ${trim(whole)}`,
      rows: [
        { label: "Part", value: trim(part) },
        { label: "Whole", value: trim(whole) },
        { label: "Percentage", value: `${trim(headline)}%` },
        { label: "Remaining share", value: `${trim(100 - headline)}%` },
      ],
      donut: [
        { label: `${trim(headline)}%`, value: clamp01(part / whole), color: ORANGE },
        { label: "Rest", value: clamp01(1 - part / whole), color: ZINC },
      ],
    };
  }

  // changeByPercent
  const { start, changePercent } = input;
  if (!Number.isFinite(start) || !Number.isFinite(changePercent)) return null;
  const delta = start * (changePercent / 100);
  const headline = start + delta;
  return {
    headline,
    caption: `${trim(start)} changed by ${trim(changePercent)}%`,
    rows: [
      { label: "Start value", value: trim(start) },
      { label: "Change", value: `${trim(changePercent)}%` },
      { label: "Amount of change", value: trim(delta) },
      { label: "Final value", value: trim(headline) },
    ],
    donut: [
      { label: "Start", value: clamp01(start === 0 ? 0 : start / Math.max(start, headline)), color: AMBER },
      { label: "Change", value: clamp01(start === 0 ? 1 : Math.abs(delta) / Math.max(start, headline)), color: ORANGE },
    ],
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function trim(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 2 });
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
