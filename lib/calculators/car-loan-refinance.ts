// Pure logic for the Car Loan Refinance Calculator. Compares the current car
// loan against a new refinanced loan, computing the new monthly payment, the
// monthly and lifetime savings, and a balance schedule for charting both loans.

export interface CarLoanRefinanceInput {
  currentBalance: number; // remaining balance on the current loan
  currentRatePct: number; // current annual interest rate
  monthsRemaining: number; // months left on the current loan
  newRatePct: number; // new annual interest rate
  newTermMonths: number; // term of the new loan in months
}

export interface RefiYearPoint {
  month: number;
  currentBalance: number;
  newBalance: number;
}

export interface CarLoanRefinanceResult {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  currentTotalRemaining: number; // total still owed on the current loan
  newTotalCost: number; // total paid over the new loan
  totalSavings: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  schedule: RefiYearPoint[];
}

function monthlyPayment(balance: number, monthlyRate: number, months: number): number {
  if (balance <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return balance / months;
  return (balance * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function amortizeBalances(balance: number, monthlyRate: number, payment: number, months: number): number[] {
  const out: number[] = [balance];
  let bal = balance;
  for (let m = 1; m <= months; m++) {
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal > bal) principal = bal;
    bal = Math.max(0, bal - principal);
    out.push(bal);
  }
  return out;
}

export function computeCarLoanRefinance(input: CarLoanRefinanceInput): CarLoanRefinanceResult | null {
  const { currentBalance, currentRatePct, monthsRemaining, newRatePct, newTermMonths } = input;

  if (!Number.isFinite(currentBalance) || currentBalance <= 0) return null;
  if (!Number.isFinite(monthsRemaining) || monthsRemaining <= 0) return null;
  if (!Number.isFinite(newTermMonths) || newTermMonths <= 0) return null;
  if (currentRatePct < 0 || newRatePct < 0) return null;

  const curRate = currentRatePct / 100 / 12;
  const newRate = newRatePct / 100 / 12;
  const curMonths = Math.round(monthsRemaining);
  const newMonths = Math.round(newTermMonths);

  const currentMonthlyPayment = monthlyPayment(currentBalance, curRate, curMonths);
  const newMonthlyPayment = monthlyPayment(currentBalance, newRate, newMonths);

  const currentTotalRemaining = currentMonthlyPayment * curMonths;
  const newTotalCost = newMonthlyPayment * newMonths;

  const currentTotalInterest = currentTotalRemaining - currentBalance;
  const newTotalInterest = newTotalCost - currentBalance;

  const curBalances = amortizeBalances(currentBalance, curRate, currentMonthlyPayment, curMonths);
  const newBalances = amortizeBalances(currentBalance, newRate, newMonthlyPayment, newMonths);
  const horizon = Math.max(curMonths, newMonths);

  const schedule: RefiYearPoint[] = [];
  for (let m = 0; m <= horizon; m++) {
    schedule.push({
      month: m,
      currentBalance: m < curBalances.length ? curBalances[m] : 0,
      newBalance: m < newBalances.length ? newBalances[m] : 0,
    });
  }

  return {
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlySavings: currentMonthlyPayment - newMonthlyPayment,
    currentTotalRemaining,
    newTotalCost,
    totalSavings: currentTotalRemaining - newTotalCost,
    currentTotalInterest,
    newTotalInterest,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
