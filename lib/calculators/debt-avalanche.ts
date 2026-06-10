// Pure logic for the Debt Avalanche Calculator.
// The avalanche method directs every spare dollar at the debt with the highest
// interest rate first, while paying minimums on the rest. Once a debt is cleared,
// its payment rolls into the next-highest-rate debt. This simulates the payoff
// month by month and reports the total months, total interest and a per-month
// balance schedule for charting.

export interface DebtInput {
  name: string;
  balance: number;
  annualRatePct: number;
  minPayment: number;
}

export interface DebtAvalancheInput {
  debts: DebtInput[];
  extraPayment: number; // additional amount applied each month beyond the minimums
}

export interface DebtBalancePoint {
  month: number;
  balance: number; // total balance remaining across all debts
}

export interface DebtPayoffRow {
  name: string;
  payoffMonth: number; // month this specific debt hit zero
  interestPaid: number;
}

export interface DebtAvalancheResult {
  months: number; // months to be debt free
  totalInterest: number;
  totalPaid: number;
  startingBalance: number;
  perDebt: DebtPayoffRow[];
  schedule: DebtBalancePoint[];
}

const MAX_MONTHS = 1200; // 100-year guard against never-ending payoffs

export function computeDebtAvalanche(
  input: DebtAvalancheInput,
): DebtAvalancheResult | null {
  const extra = Number.isFinite(input.extraPayment) ? Math.max(input.extraPayment, 0) : 0;

  // Validate and clone the debts; drop anything with a non-positive balance.
  const debts = input.debts
    .filter((d) => Number.isFinite(d.balance) && d.balance > 0)
    .map((d) => ({
      name: d.name,
      balance: d.balance,
      rate: (Number.isFinite(d.annualRatePct) ? d.annualRatePct : 0) / 100 / 12,
      min: Number.isFinite(d.minPayment) ? Math.max(d.minPayment, 0) : 0,
      interestPaid: 0,
      payoffMonth: 0,
    }));

  if (debts.length === 0) return null;

  const startingBalance = debts.reduce((s, d) => s + d.balance, 0);

  // Sanity check: total of minimums plus extra must at least cover interest,
  // otherwise the balance grows forever. Bail out as invalid.
  const firstMonthInterest = debts.reduce((s, d) => s + d.balance * d.rate, 0);
  const totalBudget = debts.reduce((s, d) => s + d.min, 0) + extra;
  if (totalBudget <= firstMonthInterest) return null;

  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  const schedule: DebtBalancePoint[] = [{ month: 0, balance: startingBalance }];

  while (debts.some((d) => d.balance > 0) && month < MAX_MONTHS) {
    month++;

    // Accrue interest first.
    for (const d of debts) {
      if (d.balance <= 0) continue;
      const interest = d.balance * d.rate;
      d.balance += interest;
      d.interestPaid += interest;
      totalInterest += interest;
    }

    // Pay minimums on every active debt.
    let budget = totalBudget;
    for (const d of debts) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.min, d.balance);
      d.balance -= pay;
      budget -= pay;
      totalPaid += pay;
    }

    // Direct whatever is left at the highest-rate active debt, then the next, etc.
    const active = debts
      .filter((d) => d.balance > 0)
      .sort((a, b) => b.rate - a.rate);

    for (const d of active) {
      if (budget <= 0) break;
      const pay = Math.min(budget, d.balance);
      d.balance -= pay;
      budget -= pay;
      totalPaid += pay;
    }

    // Record payoff month for anything that just cleared.
    for (const d of debts) {
      if (d.balance <= 0 && d.payoffMonth === 0) {
        d.payoffMonth = month;
        d.balance = 0;
      }
    }

    const remaining = debts.reduce((s, d) => s + Math.max(d.balance, 0), 0);
    schedule.push({ month, balance: remaining });
  }

  const perDebt: DebtPayoffRow[] = debts.map((d) => ({
    name: d.name,
    payoffMonth: d.payoffMonth || month,
    interestPaid: d.interestPaid,
  }));

  return {
    months: month,
    totalInterest,
    totalPaid,
    startingBalance,
    perDebt,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}

export function formatMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(" ") || "0 months";
}
