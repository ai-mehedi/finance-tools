// Pure logic for the Zero Based Budget Calculator.
// In zero-based budgeting every dollar of monthly income is assigned a job, so
// income minus the sum of all category allocations should equal exactly zero.
// This module totals the allocations, compares them to income, and exposes a
// per-category breakdown (with share of income) for charting.

export interface BudgetCategory {
  name: string;
  amount: number;
}

export interface ZeroBasedBudgetInput {
  monthlyIncome: number;
  categories: BudgetCategory[];
}

export interface BudgetSlice {
  name: string;
  amount: number;
  share: number; // fraction of income (0..1+), used for the donut and bars
}

export interface ZeroBasedBudgetResult {
  income: number;
  allocated: number; // sum of all category amounts
  remaining: number; // income minus allocated; zero is the goal
  status: "balanced" | "under" | "over"; // every dollar assigned, money left, or over budget
  largestCategory: BudgetSlice | null;
  slices: BudgetSlice[];
}

// A few cents of float noise should still count as a balanced budget.
const EPSILON = 0.005;

export function computeZeroBasedBudget(input: ZeroBasedBudgetInput): ZeroBasedBudgetResult | null {
  const { monthlyIncome, categories } = input;

  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) return null;

  const clean = categories
    .map((c) => ({ name: c.name.trim() || "Unnamed", amount: Number(c.amount) }))
    .filter((c) => Number.isFinite(c.amount) && c.amount > 0);

  if (monthlyIncome === 0 && clean.length === 0) return null;
  if (clean.some((c) => c.amount < 0)) return null;

  const allocated = clean.reduce((sum, c) => sum + c.amount, 0);
  const remaining = monthlyIncome - allocated;

  let status: ZeroBasedBudgetResult["status"];
  if (Math.abs(remaining) <= EPSILON) status = "balanced";
  else if (remaining > 0) status = "under";
  else status = "over";

  const denom = monthlyIncome > 0 ? monthlyIncome : allocated || 1;
  const slices: BudgetSlice[] = clean
    .map((c) => ({ name: c.name, amount: c.amount, share: c.amount / denom }))
    .sort((a, b) => b.amount - a.amount);

  const largestCategory = slices.length > 0 ? slices[0] : null;

  return {
    income: monthlyIncome,
    allocated,
    remaining,
    status,
    largestCategory,
    slices,
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

export function formatPct(fraction: number): string {
  if (!Number.isFinite(fraction)) return "0%";
  return `${(fraction * 100).toFixed(0)}%`;
}
