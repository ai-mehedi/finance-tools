// Pure logic for the SWP (Systematic Withdrawal Plan) Calculator.
// You invest a lump sum, it keeps earning a return, and you withdraw a fixed
// amount every month. The balance compounds on what is left after each
// withdrawal. We simulate month by month and expose a per-year schedule so the
// chart can show the balance running down (or up) over time.

export interface SwpInput {
  initialInvestment: number;
  monthlyWithdrawal: number;
  annualRatePct: number;
  years: number;
}

export interface SwpYearPoint {
  year: number;
  balance: number; // balance at end of year (floored at 0)
  withdrawn: number; // cumulative amount withdrawn so far
}

export interface SwpResult {
  finalBalance: number;
  totalWithdrawn: number;
  totalInterest: number; // growth earned across the whole horizon
  depletedMonth: number | null; // month the balance hit zero, or null if it lasted
  schedule: SwpYearPoint[];
}

export function computeSwp(input: SwpInput): SwpResult | null {
  const { initialInvestment, monthlyWithdrawal, annualRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (initialInvestment <= 0 || monthlyWithdrawal < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const months = Math.round(years * 12);

  let balance = initialInvestment;
  let totalWithdrawn = 0;
  let depletedMonth: number | null = null;

  const schedule: SwpYearPoint[] = [
    { year: 0, balance: initialInvestment, withdrawn: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    // Earn this month's return, then take the withdrawal.
    balance = balance * (1 + monthlyRate);
    if (balance >= monthlyWithdrawal) {
      balance -= monthlyWithdrawal;
      totalWithdrawn += monthlyWithdrawal;
    } else {
      // Final partial withdrawal empties the account.
      totalWithdrawn += balance;
      balance = 0;
      if (depletedMonth === null) depletedMonth = m;
    }

    if (m % 12 === 0) {
      schedule.push({ year: m / 12, balance, withdrawn: totalWithdrawn });
    }
  }

  // Ensure the final year is captured if months is not a multiple of 12.
  if (months % 12 !== 0) {
    schedule.push({ year: months / 12, balance, withdrawn: totalWithdrawn });
  }

  const finalBalance = balance;
  const totalInterest = finalBalance + totalWithdrawn - initialInvestment;

  return { finalBalance, totalWithdrawn, totalInterest, depletedMonth, schedule };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
