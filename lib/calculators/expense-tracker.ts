// Pure logic for the Expense Tracker tool.
// Takes a list of expense entries (each with a category and an amount) plus an
// optional monthly income, totals the spending, groups it by category and
// reports how much income is left. A per-category breakdown is exposed for a
// simple bar chart.

export interface ExpenseEntry {
  id: string;
  label: string;
  category: string;
  amount: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  share: number; // percent of total spending (0 to 100)
}

export interface ExpenseTrackerResult {
  totalSpending: number;
  income: number;
  remaining: number; // income minus spending (can be negative)
  spentPct: number; // spending as a percent of income (0 if no income)
  byCategory: CategoryTotal[];
  largestCategory: CategoryTotal | null;
}

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Insurance",
  "Health",
  "Entertainment",
  "Savings",
  "Other",
] as const;

export function computeExpenseTracker(
  entries: ExpenseEntry[],
  income: number
): ExpenseTrackerResult {
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;

  const totals = new Map<string, number>();
  let totalSpending = 0;

  for (const e of entries) {
    const amt = Number.isFinite(e.amount) && e.amount > 0 ? e.amount : 0;
    if (amt === 0) continue;
    totalSpending += amt;
    totals.set(e.category, (totals.get(e.category) ?? 0) + amt);
  }

  const byCategory: CategoryTotal[] = Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      share: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const remaining = safeIncome - totalSpending;
  const spentPct = safeIncome > 0 ? (totalSpending / safeIncome) * 100 : 0;

  return {
    totalSpending,
    income: safeIncome,
    remaining,
    spentPct,
    byCategory,
    largestCategory: byCategory.length > 0 ? byCategory[0] : null,
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
