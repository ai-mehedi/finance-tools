// Pure logic for the Student Budget Calculator.
// Adds up a student's monthly income (job, financial aid, family support, other)
// and subtracts typical living costs (rent, food, transport, tuition/fees set
// aside, books and supplies, phone/internet, fun, other). Returns the monthly
// surplus or shortfall plus a category breakdown for a donut chart.

export interface StudentBudgetInput {
  // income (monthly)
  jobIncome: number;
  aidIncome: number; // grants, loans, scholarships averaged to a monthly figure
  familySupport: number;
  otherIncome: number;
  // expenses (monthly)
  housing: number;
  food: number;
  transport: number;
  tuitionSetAside: number; // tuition or fees you save toward each month
  booksSupplies: number;
  phoneInternet: number;
  funMisc: number;
  otherExpense: number;
}

export interface BudgetCategory {
  label: string;
  value: number;
  color: string;
}

export interface StudentBudgetResult {
  totalIncome: number;
  totalExpenses: number;
  net: number; // positive = surplus, negative = shortfall
  savingsRatePct: number; // net divided by income, as a percentage
  expenseCategories: BudgetCategory[]; // non-zero expense slices for the donut
  topExpense: BudgetCategory | null;
}

const EXPENSE_META: { key: keyof StudentBudgetInput; label: string; color: string }[] = [
  { key: "housing", label: "Housing", color: "#f97316" },
  { key: "food", label: "Food", color: "#fb923c" },
  { key: "transport", label: "Transport", color: "#fdba74" },
  { key: "tuitionSetAside", label: "Tuition / fees", color: "#ea580c" },
  { key: "booksSupplies", label: "Books & supplies", color: "#fcd34d" },
  { key: "phoneInternet", label: "Phone & internet", color: "#fb7185" },
  { key: "funMisc", label: "Fun & misc", color: "#facc15" },
  { key: "otherExpense", label: "Other", color: "#a1a1aa" },
];

export function computeStudentBudget(input: StudentBudgetInput): StudentBudgetResult | null {
  const values = Object.values(input);
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;

  const totalIncome =
    input.jobIncome + input.aidIncome + input.familySupport + input.otherIncome;
  const totalExpenses =
    input.housing +
    input.food +
    input.transport +
    input.tuitionSetAside +
    input.booksSupplies +
    input.phoneInternet +
    input.funMisc +
    input.otherExpense;

  if (totalIncome <= 0 && totalExpenses <= 0) return null;

  const net = totalIncome - totalExpenses;
  const savingsRatePct = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

  const expenseCategories = EXPENSE_META.map((m) => ({
    label: m.label,
    value: input[m.key],
    color: m.color,
  })).filter((c) => c.value > 0);

  const topExpense =
    expenseCategories.length > 0
      ? expenseCategories.reduce((a, b) => (b.value > a.value ? b : a))
      : null;

  return { totalIncome, totalExpenses, net, savingsRatePct, expenseCategories, topExpense };
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
