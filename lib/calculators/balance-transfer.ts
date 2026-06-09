// Pure logic for the Balance Transfer Calculator.
// Compares keeping a credit card balance at its current APR against moving it
// to a balance transfer card with an intro 0% (or low) APR plus a transfer fee.
// Both scenarios assume the same fixed monthly payment, and we amortize month
// by month to build a payoff schedule for charting.

export interface BalanceTransferInput {
  balance: number;
  currentAprPct: number;
  monthlyPayment: number;
  transferFeePct: number;
  introAprPct: number;
  introMonths: number;
  postIntroAprPct: number; // APR after the intro window ends on the new card
}

export interface BalanceTransferPoint {
  month: number;
  current: number; // balance if you stay put
  transfer: number; // balance on the transfer card
}

export interface BalanceTransferResult {
  transferFee: number;
  currentInterest: number;
  transferInterest: number; // includes the transfer fee
  currentMonths: number;
  transferMonths: number;
  savings: number; // positive means the transfer saves money
  paymentTooLow: boolean; // payment cannot cover first month interest on current card
  schedule: BalanceTransferPoint[];
}

const MAX_MONTHS = 600;

// Amortize a balance with a possibly changing monthly rate. Returns total
// interest paid, months to clear, and the per-month balance trail.
function amortize(
  startBalance: number,
  payment: number,
  rateAt: (month: number) => number,
): { interest: number; months: number; trail: number[] } {
  let balance = startBalance;
  let interest = 0;
  const trail: number[] = [startBalance];
  let m = 0;
  while (balance > 0 && m < MAX_MONTHS) {
    m++;
    const r = rateAt(m);
    const charge = balance * r;
    interest += charge;
    balance = balance + charge - payment;
    if (balance < 0) balance = 0;
    trail.push(balance);
  }
  return { interest, months: m, trail };
}

export function computeBalanceTransfer(input: BalanceTransferInput): BalanceTransferResult | null {
  const {
    balance,
    currentAprPct,
    monthlyPayment,
    transferFeePct,
    introAprPct,
    introMonths,
    postIntroAprPct,
  } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null;
  if (currentAprPct < 0 || transferFeePct < 0 || introAprPct < 0 || postIntroAprPct < 0) return null;
  if (!Number.isFinite(introMonths) || introMonths < 0) return null;

  const currentRate = currentAprPct / 100 / 12;
  const introRate = introAprPct / 100 / 12;
  const postRate = postIntroAprPct / 100 / 12;
  const intro = Math.round(introMonths);

  // If the payment cannot cover the first month of interest on the current
  // card, the balance never falls. Flag it instead of looping forever.
  const paymentTooLow = balance * currentRate >= monthlyPayment;

  const current = amortize(balance, monthlyPayment, () => currentRate);

  const transferFee = balance * (transferFeePct / 100);
  const transferStart = balance + transferFee;
  const transfer = amortize(transferStart, monthlyPayment, (m) => (m <= intro ? introRate : postRate));

  // Interest on the current card; for the transfer card we count the fee as a cost too.
  const currentInterest = current.interest;
  const transferInterest = transfer.interest + transferFee;

  const len = Math.max(current.trail.length, transfer.trail.length);
  const schedule: BalanceTransferPoint[] = [];
  for (let i = 0; i < len; i++) {
    schedule.push({
      month: i,
      current: i < current.trail.length ? current.trail[i] : 0,
      transfer: i < transfer.trail.length ? transfer.trail[i] : 0,
    });
  }

  return {
    transferFee,
    currentInterest,
    transferInterest,
    currentMonths: current.months,
    transferMonths: transfer.months,
    savings: currentInterest - transferInterest,
    paymentTooLow,
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
