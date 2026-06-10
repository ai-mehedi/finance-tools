// Pure logic for the Debt Consolidation Calculator.
// Compares the cost of keeping several existing debts (each paid with its own
// minimum/fixed payment) against folding them into a single consolidation loan
// at a new rate and term. Returns total interest, payoff time and monthly
// payment for each scenario plus a per-month balance schedule for charting.

export interface ExistingDebt {
  balance: number;
  annualRatePct: number;
  monthlyPayment: number;
}

export interface DebtConsolidationInput {
  debts: ExistingDebt[];
  newAnnualRatePct: number;
  newTermMonths: number;
  fees: number; // origination / balance-transfer fees rolled into the loan
}

export interface ScenarioPoint {
  month: number;
  currentBalance: number;
  consolidatedBalance: number;
}

export interface DebtConsolidationResult {
  totalBalance: number;
  currentMonthlyPayment: number;
  currentMonths: number;
  currentTotalInterest: number;
  currentTotalPaid: number;
  newMonthlyPayment: number;
  newMonths: number;
  newTotalInterest: number;
  newTotalPaid: number;
  monthlySavings: number;
  interestSavings: number;
  schedule: ScenarioPoint[];
}

const MAX_MONTHS = 1200; // 100-year safety cap

// Amortize a list of independent debts, each with its own fixed payment.
// Returns months to clear all of them, total interest, and a per-month total
// outstanding balance series.
function amortizeIndependent(debts: ExistingDebt[]): {
  months: number;
  totalInterest: number;
  totalPaid: number;
  series: number[];
} | null {
  const state = debts.map((d) => ({ ...d }));
  // Every debt must be able to make progress in month one.
  for (const d of state) {
    const monthlyInterest = (d.balance * d.annualRatePct) / 100 / 12;
    if (d.balance > 0 && d.monthlyPayment <= monthlyInterest) return null;
  }

  let totalInterest = 0;
  let totalPaid = 0;
  const startTotal = state.reduce((s, d) => s + d.balance, 0);
  const series: number[] = [startTotal];

  let month = 0;
  while (state.some((d) => d.balance > 0.005) && month < MAX_MONTHS) {
    month++;
    for (const d of state) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.annualRatePct) / 100 / 12;
      const pay = Math.min(d.monthlyPayment, d.balance + interest);
      const principal = pay - interest;
      d.balance = Math.max(0, d.balance - principal);
      totalInterest += interest;
      totalPaid += pay;
    }
    series.push(state.reduce((s, d) => s + d.balance, 0));
  }

  if (month >= MAX_MONTHS) return null;
  return { months: month, totalInterest, totalPaid, series };
}

// Standard fixed-rate loan amortization given a principal, annual rate and term.
function amortizeFixedTerm(
  principal: number,
  annualRatePct: number,
  termMonths: number
): { payment: number; totalInterest: number; totalPaid: number; series: number[] } {
  const r = annualRatePct / 100 / 12;
  let payment: number;
  if (r === 0) {
    payment = principal / termMonths;
  } else {
    payment = (principal * r) / (1 - Math.pow(1 + r, -termMonths));
  }

  let balance = principal;
  let totalInterest = 0;
  const series: number[] = [principal];
  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * r;
    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    series.push(balance);
  }
  return { payment, totalInterest, totalPaid: payment * termMonths, series };
}

export function computeDebtConsolidation(
  input: DebtConsolidationInput
): DebtConsolidationResult | null {
  const { debts, newAnnualRatePct, newTermMonths, fees } = input;

  const active = debts.filter((d) => d.balance > 0);
  if (active.length === 0) return null;
  if (!Number.isFinite(newTermMonths) || newTermMonths <= 0) return null;
  if (!Number.isFinite(newAnnualRatePct) || newAnnualRatePct < 0) return null;
  if (fees < 0) return null;

  const totalBalance = active.reduce((s, d) => s + d.balance, 0);
  const currentMonthlyPayment = active.reduce((s, d) => s + d.monthlyPayment, 0);

  const current = amortizeIndependent(active);
  if (!current) return null;

  const principal = totalBalance + fees;
  const consolidated = amortizeFixedTerm(principal, newAnnualRatePct, newTermMonths);

  // Build a combined month-by-month series long enough for the slower plan.
  const maxLen = Math.max(current.series.length, consolidated.series.length);
  const schedule: ScenarioPoint[] = [];
  for (let m = 0; m < maxLen; m++) {
    schedule.push({
      month: m,
      currentBalance: m < current.series.length ? current.series[m] : 0,
      consolidatedBalance: m < consolidated.series.length ? consolidated.series[m] : 0,
    });
  }

  return {
    totalBalance,
    currentMonthlyPayment,
    currentMonths: current.months,
    currentTotalInterest: current.totalInterest,
    currentTotalPaid: current.totalPaid,
    newMonthlyPayment: consolidated.payment,
    newMonths: newTermMonths,
    newTotalInterest: consolidated.totalInterest + fees,
    newTotalPaid: consolidated.totalPaid,
    monthlySavings: currentMonthlyPayment - consolidated.payment,
    interestSavings: current.totalInterest - (consolidated.totalInterest + fees),
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
