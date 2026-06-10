// Pure logic for the Income vs Expense Calculator.
// Sums monthly income against monthly expenses, returns the surplus or
// deficit, the savings rate, and a 12-month projection of cumulative
// savings so the running balance can be charted.

export interface IncomeVsExpenseInput {
  monthlyIncome: number;
  housing: number;
  transport: number;
  food: number;
  other: number;
}

export interface SavingsPoint {
  month: number;
  cumulative: number; // running cumulative net savings (can be negative)
}

export interface ExpenseShare {
  label: string;
  value: number;
  share: number; // fraction of total expenses
}

export interface IncomeVsExpenseResult {
  totalIncome: number;
  totalExpenses: number;
  net: number; // income minus expenses (surplus if positive)
  savingsRate: number; // net / income
  annualNet: number;
  shares: ExpenseShare[];
  schedule: SavingsPoint[];
}

export function computeIncomeVsExpense(
  input: IncomeVsExpenseInput
): IncomeVsExpenseResult | null {
  const { monthlyIncome, housing, transport, food, other } = input;

  const values = [monthlyIncome, housing, transport, food, other];
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;
  if (monthlyIncome <= 0) return null;

  const totalIncome = monthlyIncome;
  const totalExpenses = housing + transport + food + other;
  const net = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? net / totalIncome : 0;

  const rawShares: { label: string; value: number }[] = [
    { label: "Housing", value: housing },
    { label: "Transport", value: transport },
    { label: "Food", value: food },
    { label: "Other", value: other },
  ];
  const shares: ExpenseShare[] = rawShares.map((s) => ({
    ...s,
    share: totalExpenses > 0 ? s.value / totalExpenses : 0,
  }));

  const schedule: SavingsPoint[] = [{ month: 0, cumulative: 0 }];
  let cumulative = 0;
  for (let m = 1; m <= 12; m++) {
    cumulative += net;
    schedule.push({ month: m, cumulative });
  }

  return {
    totalIncome,
    totalExpenses,
    net,
    savingsRate,
    annualNet: net * 12,
    shares,
    schedule,
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
