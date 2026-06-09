// Pure logic for the Cash Flow Calculator.
// Net cash flow is total income minus total expenses for a period.
// Income and expenses are grouped so the widget can chart a breakdown
// and project a simple yearly balance from the monthly net.

export interface CashFlowInput {
  // Monthly income sources
  salary: number;
  otherIncome: number;
  // Monthly expenses
  housing: number;
  transport: number;
  food: number;
  debtPayments: number;
  otherExpenses: number;
  // How many years to project the running balance for the chart
  projectionYears: number;
}

export interface CashFlowYearPoint {
  year: number;
  balance: number; // cumulative net cash flow at end of year
}

export interface CashFlowResult {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number; // monthly
  savingsRatePct: number; // net / income as a percent
  annualNet: number;
  schedule: CashFlowYearPoint[];
}

export function computeCashFlow(input: CashFlowInput): CashFlowResult | null {
  const {
    salary,
    otherIncome,
    housing,
    transport,
    food,
    debtPayments,
    otherExpenses,
    projectionYears,
  } = input;

  const values = [salary, otherIncome, housing, transport, food, debtPayments, otherExpenses];
  if (values.some((v) => !Number.isFinite(v) || v < 0)) return null;
  if (!Number.isFinite(projectionYears) || projectionYears <= 0) return null;

  const totalIncome = salary + otherIncome;
  const totalExpenses = housing + transport + food + debtPayments + otherExpenses;
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRatePct = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
  const annualNet = netCashFlow * 12;

  const years = Math.round(projectionYears);
  const schedule: CashFlowYearPoint[] = [{ year: 0, balance: 0 }];
  for (let y = 1; y <= years; y++) {
    schedule.push({ year: y, balance: annualNet * y });
  }

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRatePct,
    annualNet,
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
