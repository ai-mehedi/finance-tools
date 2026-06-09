// Pure logic for the Debt Snowball Calculator.
// The snowball method pays the minimum on every debt, then throws all spare
// cash at the SMALLEST balance first. When a debt is cleared, its payment
// rolls onto the next smallest, so the amount applied snowballs over time.
// We simulate month by month and expose a per-month schedule for charting the
// total remaining balance.

export interface DebtInput {
  name: string;
  balance: number;
  annualRatePct: number;
  minPayment: number;
}

export interface SnowballInput {
  debts: DebtInput[];
  extraPayment: number; // additional dollars applied each month on top of minimums
}

export interface SnowballMonthPoint {
  month: number;
  balance: number; // total remaining balance across all debts
}

export interface PayoffDetail {
  name: string;
  payoffMonth: number; // month index this debt hit zero
  interestPaid: number;
}

export interface SnowballResult {
  months: number; // months until everything is paid off
  totalInterest: number;
  totalPaid: number;
  perDebt: PayoffDetail[];
  schedule: SnowballMonthPoint[];
}

const MAX_MONTHS = 1200; // 100 year safety cap

export function computeSnowball(input: SnowballInput): SnowballResult | null {
  const { debts, extraPayment } = input;
  if (extraPayment < 0 || !Number.isFinite(extraPayment)) return null;

  const active = debts.filter((d) => d.balance > 0);
  if (active.length === 0) return null;
  for (const d of active) {
    if (!Number.isFinite(d.balance) || d.balance < 0) return null;
    if (!Number.isFinite(d.annualRatePct) || d.annualRatePct < 0) return null;
    if (!Number.isFinite(d.minPayment) || d.minPayment < 0) return null;
  }

  // Snowball order: smallest balance first.
  const order = active
    .map((d, i) => ({ ...d, i }))
    .sort((a, b) => a.balance - b.balance);

  const bal = order.map((d) => d.balance);
  const rate = order.map((d) => d.annualRatePct / 100 / 12);
  const min = order.map((d) => d.minPayment);
  const interestAcc = order.map(() => 0);
  const payoffMonth = order.map(() => 0);

  const totalMin = min.reduce((s, m) => s + m, 0);
  const startBalance = bal.reduce((s, b) => s + b, 0);

  const schedule: SnowballMonthPoint[] = [{ month: 0, balance: startBalance }];
  let totalInterest = 0;
  let month = 0;

  // Guard against a budget that cannot even cover interest.
  // If the monthly pool never reduces the balance, bail out.
  let remaining = order.length;

  while (remaining > 0 && month < MAX_MONTHS) {
    month++;
    // 1. Accrue interest on every active debt.
    for (let k = 0; k < bal.length; k++) {
      if (bal[k] <= 0) continue;
      const interest = bal[k] * rate[k];
      bal[k] += interest;
      interestAcc[k] += interest;
      totalInterest += interest;
    }

    // 2. Pool of money for this month = all minimums (only for active debts) + extra.
    let pool = extraPayment;
    for (let k = 0; k < bal.length; k++) {
      if (bal[k] > 0) pool += min[k];
    }

    // 3. Pay minimums first, smallest balance order, then dump the leftover on the
    //    smallest remaining balance (the snowball target).
    // First pass: apply each debt's own minimum.
    for (let k = 0; k < bal.length && pool > 0; k++) {
      if (bal[k] <= 0) continue;
      const pay = Math.min(min[k], bal[k], pool);
      bal[k] -= pay;
      pool -= pay;
    }
    // Second pass: snowball the rest onto the first still-open debt.
    for (let k = 0; k < bal.length && pool > 0; k++) {
      if (bal[k] <= 0) continue;
      const pay = Math.min(bal[k], pool);
      bal[k] -= pay;
      pool -= pay;
    }

    // 4. Mark any newly cleared debts.
    for (let k = 0; k < bal.length; k++) {
      if (bal[k] <= 0.005 && payoffMonth[k] === 0) {
        bal[k] = 0;
        payoffMonth[k] = month;
        remaining--;
      }
    }

    const totalNow = bal.reduce((s, b) => s + b, 0);
    schedule.push({ month, balance: totalNow });

    // Detect a stuck situation: budget below total interest so balance is not falling.
    if (month >= 2) {
      const prev = schedule[schedule.length - 2].balance;
      if (totalNow >= prev - 0.005 && totalMin + extraPayment <= 0) return null;
      if (totalNow >= prev - 0.005 && month > 3 && totalNow >= startBalance) return null;
    }
  }

  if (remaining > 0) return null; // never paid off within the cap

  const perDebt: PayoffDetail[] = order.map((d, k) => ({
    name: d.name,
    payoffMonth: payoffMonth[k],
    interestPaid: interestAcc[k],
  }));
  perDebt.sort((a, b) => a.payoffMonth - b.payoffMonth);

  return {
    months: month,
    totalInterest,
    totalPaid: startBalance + totalInterest,
    perDebt,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatMonths(m: number): string {
  if (!Number.isFinite(m) || m <= 0) return "0 months";
  const years = Math.floor(m / 12);
  const months = m % 12;
  const yPart = years > 0 ? `${years} yr${years > 1 ? "s" : ""}` : "";
  const mPart = months > 0 ? `${months} mo` : "";
  return [yPart, mPart].filter(Boolean).join(" ") || "0 months";
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
