// Pure logic for the Loan Comparison Calculator.
// Compares two fixed-rate, fully amortizing loans side by side. For each loan
// it computes the standard monthly payment, total interest and total cost, then
// folds in any one-time fees so the comparison reflects true out-of-pocket cost.
// Also exposes a small per-period schedule of remaining balances for charting.

export interface LoanInput {
  amount: number; // principal borrowed
  annualRatePct: number; // nominal annual interest rate
  years: number; // term in years
  fees: number; // one-time upfront fees/points in dollars
}

export interface LoanOutcome {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number; // principal + interest (payments only)
  totalCost: number; // totalPaid + fees
  schedule: { month: number; balance: number }[];
}

export interface LoanComparisonInput {
  loanA: LoanInput;
  loanB: LoanInput;
}

export interface LoanComparisonResult {
  a: LoanOutcome;
  b: LoanOutcome;
  monthlyDiff: number; // a.monthly - b.monthly
  totalCostDiff: number; // a.totalCost - b.totalCost
  cheaper: "A" | "B" | "tie"; // by total cost
  maxBalance: number; // for charting both lines on one scale
}

function amortize(loan: LoanInput): LoanOutcome | null {
  const { amount, annualRatePct, years, fees } = loan;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(fees) || fees < 0) return null;

  const months = Math.round(years * 12);
  const i = annualRatePct / 100 / 12;

  let monthlyPayment: number;
  if (i === 0) {
    monthlyPayment = amount / months;
  } else {
    const factor = Math.pow(1 + i, months);
    monthlyPayment = (amount * i * factor) / (factor - 1);
  }

  // Build a sampled schedule (cap points so charts stay light).
  const schedule: { month: number; balance: number }[] = [{ month: 0, balance: amount }];
  const step = Math.max(1, Math.round(months / 48));
  let balance = amount;
  for (let m = 1; m <= months; m++) {
    const interest = balance * i;
    balance = balance + interest - monthlyPayment;
    if (balance < 0) balance = 0;
    if (m % step === 0 || m === months) {
      schedule.push({ month: m, balance });
    }
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - amount;
  const totalCost = totalPaid + fees;

  return { monthlyPayment, totalInterest, totalPaid, totalCost, schedule };
}

export function computeLoanComparison(input: LoanComparisonInput): LoanComparisonResult | null {
  const a = amortize(input.loanA);
  const b = amortize(input.loanB);
  if (!a || !b) return null;

  const monthlyDiff = a.monthlyPayment - b.monthlyPayment;
  const totalCostDiff = a.totalCost - b.totalCost;

  let cheaper: "A" | "B" | "tie" = "tie";
  if (Math.abs(totalCostDiff) > 0.5) cheaper = totalCostDiff < 0 ? "A" : "B";

  const maxBalance = Math.max(
    ...a.schedule.map((p) => p.balance),
    ...b.schedule.map((p) => p.balance),
    1
  );

  return { a, b, monthlyDiff, totalCostDiff, cheaper, maxBalance };
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
