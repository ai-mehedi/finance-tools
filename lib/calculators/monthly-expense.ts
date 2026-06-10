// Pure logic for the Monthly Expense Calculator.
// Sums a household's monthly spending across common categories, compares it to
// monthly take-home income, and reports the leftover (or shortfall) plus a
// savings rate. Exposes a per-category breakdown for charting a donut.

export interface ExpenseCategoryInput {
  housing: number;
  utilities: number;
  food: number;
  transport: number;
  insurance: number;
  debt: number;
  entertainment: number;
  other: number;
}

export interface MonthlyExpenseInput extends ExpenseCategoryInput {
  monthlyIncome: number;
}

export interface ExpenseSlice {
  key: keyof ExpenseCategoryInput;
  label: string;
  value: number;
  share: number; // fraction of total expenses, 0..1
  color: string;
}

export interface MonthlyExpenseResult {
  totalExpenses: number;
  monthlyIncome: number;
  leftover: number; // income minus expenses; negative means shortfall
  savingsRatePct: number; // leftover as a percent of income
  largestCategory: ExpenseSlice | null;
  annualExpenses: number;
  slices: ExpenseSlice[];
}

const CATEGORY_META: { key: keyof ExpenseCategoryInput; label: string; color: string }[] = [
  { key: "housing", label: "Housing", color: "#f97316" },
  { key: "utilities", label: "Utilities", color: "#fb923c" },
  { key: "food", label: "Food", color: "#fdba74" },
  { key: "transport", label: "Transport", color: "#fcd34d" },
  { key: "insurance", label: "Insurance", color: "#fbbf24" },
  { key: "debt", label: "Debt payments", color: "#f59e0b" },
  { key: "entertainment", label: "Entertainment", color: "#d97706" },
  { key: "other", label: "Other", color: "#a3a3a3" },
];

export function computeMonthlyExpense(input: MonthlyExpenseInput): MonthlyExpenseResult | null {
  const values = CATEGORY_META.map((m) => input[m.key]);
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;
  if (!Number.isFinite(input.monthlyIncome) || input.monthlyIncome < 0) return null;

  const totalExpenses = values.reduce((a, b) => a + b, 0);

  const slices: ExpenseSlice[] = CATEGORY_META.map((m) => {
    const value = input[m.key];
    return {
      key: m.key,
      label: m.label,
      value,
      share: totalExpenses > 0 ? value / totalExpenses : 0,
      color: m.color,
    };
  }).filter((s) => s.value > 0);

  const monthlyIncome = input.monthlyIncome;
  const leftover = monthlyIncome - totalExpenses;
  const savingsRatePct = monthlyIncome > 0 ? (leftover / monthlyIncome) * 100 : 0;

  const largestCategory = slices.length
    ? slices.reduce((a, b) => (b.value > a.value ? b : a))
    : null;

  return {
    totalExpenses,
    monthlyIncome,
    leftover,
    savingsRatePct,
    largestCategory,
    annualExpenses: totalExpenses * 12,
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
