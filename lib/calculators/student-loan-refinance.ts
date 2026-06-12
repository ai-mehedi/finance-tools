// Pure logic for the Student Loan Refinance Calculator.
// Compares your CURRENT loan (remaining balance, current rate, months left) with a
// NEW refinanced loan (same balance, new rate, new term). Computes the monthly
// payment for each via the standard amortizing-loan formula, then the lifetime
// interest and the savings from switching. Exposes a per-year remaining-balance
// schedule for both loans so they can be charted side by side.

export interface RefinanceInput {
  balance: number; // remaining principal to refinance
  currentRatePct: number; // current annual interest rate
  monthsRemaining: number; // months left on the current loan
  newRatePct: number; // new annual interest rate offered
  newTermMonths: number; // term of the refinanced loan
}

export interface RefinanceYearPoint {
  year: number;
  current: number; // remaining balance on the current loan
  refinanced: number; // remaining balance on the new loan
}

export interface RefinanceResult {
  currentPayment: number;
  newPayment: number;
  monthlyDifference: number; // current minus new (positive = lower payment)
  currentTotalInterest: number;
  newTotalInterest: number;
  currentTotalPaid: number;
  newTotalPaid: number;
  lifetimeSavings: number; // current total paid minus new total paid
  schedule: RefinanceYearPoint[];
}

// Standard amortizing payment for a level-payment loan.
function payment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return principal;
  if (monthlyRate === 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

// Remaining balance after `k` months of level payments.
function balanceAfter(principal: number, monthlyRate: number, pmt: number, k: number): number {
  if (monthlyRate === 0) return Math.max(0, principal - pmt * k);
  const f = Math.pow(1 + monthlyRate, k);
  const bal = principal * f - pmt * ((f - 1) / monthlyRate);
  return Math.max(0, bal);
}

export function computeStudentLoanRefinance(input: RefinanceInput): RefinanceResult | null {
  const { balance, currentRatePct, monthsRemaining, newRatePct, newTermMonths } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(currentRatePct) || currentRatePct < 0) return null;
  if (!Number.isFinite(newRatePct) || newRatePct < 0) return null;
  if (!Number.isFinite(monthsRemaining) || monthsRemaining <= 0) return null;
  if (!Number.isFinite(newTermMonths) || newTermMonths <= 0) return null;

  const curRate = currentRatePct / 100 / 12;
  const newRate = newRatePct / 100 / 12;

  const currentPayment = payment(balance, curRate, monthsRemaining);
  const newPayment = payment(balance, newRate, newTermMonths);

  const currentTotalPaid = currentPayment * monthsRemaining;
  const newTotalPaid = newPayment * newTermMonths;
  const currentTotalInterest = currentTotalPaid - balance;
  const newTotalInterest = newTotalPaid - balance;

  const totalYears = Math.ceil(Math.max(monthsRemaining, newTermMonths) / 12);
  const schedule: RefinanceYearPoint[] = [{ year: 0, current: balance, refinanced: balance }];
  for (let y = 1; y <= totalYears; y++) {
    const k = y * 12;
    schedule.push({
      year: y,
      current: k >= monthsRemaining ? 0 : balanceAfter(balance, curRate, currentPayment, k),
      refinanced: k >= newTermMonths ? 0 : balanceAfter(balance, newRate, newPayment, k),
    });
  }

  return {
    currentPayment,
    newPayment,
    monthlyDifference: currentPayment - newPayment,
    currentTotalInterest,
    newTotalInterest,
    currentTotalPaid,
    newTotalPaid,
    lifetimeSavings: currentTotalPaid - newTotalPaid,
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
