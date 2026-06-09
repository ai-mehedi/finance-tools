// Pure logic for the Biweekly Mortgage Calculator. Compares a standard monthly
// payment plan against a biweekly plan where you pay half the monthly payment
// every two weeks (26 payments a year, which equals roughly 13 monthly payments).
// Paying the extra each year shortens the loan and cuts total interest.
//
// Both plans are amortized so we can report payoff time, interest saved and time
// saved, plus a yearly schedule of the remaining balance for charting.

export interface BiweeklyMortgageInput {
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
}

export interface BiweeklyYearPoint {
  year: number;
  monthlyBalance: number; // remaining balance under the monthly plan
  biweeklyBalance: number; // remaining balance under the biweekly plan
}

export interface BiweeklyMortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  biweeklyPayment: number; // monthlyPayment / 2
  monthlyTotalInterest: number;
  biweeklyTotalInterest: number;
  interestSaved: number;
  monthlyPayoffYears: number; // = term
  biweeklyPayoffYears: number; // actual payoff time under biweekly plan
  monthsSaved: number; // time saved, in whole months
  schedule: BiweeklyYearPoint[];
}

const MAX_PERIODS = 100000; // safety guard against non-terminating loops

export function computeBiweeklyMortgage(input: BiweeklyMortgageInput): BiweeklyMortgageResult | null {
  const { loanAmount, annualRatePct, termYears } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const monthlyRate = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);

  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
      : loanAmount / n;

  const biweeklyPayment = monthlyPayment / 2;
  const biweeklyRate = annualRatePct / 100 / 26;

  // Monthly plan: cumulative interest, plus balance at the end of each year.
  const monthlyYearEnd: number[] = [loanAmount];
  let mBalance = loanAmount;
  let monthlyInterest = 0;
  for (let m = 1; m <= n; m++) {
    const interest = mBalance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > mBalance) principal = mBalance;
    mBalance = Math.max(0, mBalance - principal);
    monthlyInterest += interest;
    if (m % 12 === 0) monthlyYearEnd.push(mBalance);
  }
  if (monthlyYearEnd.length <= termYears) monthlyYearEnd.push(mBalance);

  // Biweekly plan: 26 payments a year. Track balance at the end of each year
  // (every 26 periods) until the loan is paid off.
  const biweeklyYearEnd: number[] = [loanAmount];
  let bwBalance = loanAmount;
  let biweeklyInterest = 0;
  let periods = 0;
  while (bwBalance > 0 && periods < MAX_PERIODS) {
    periods++;
    const interest = bwBalance * biweeklyRate;
    let principal = biweeklyPayment - interest;
    if (principal <= 0) break; // payment never covers interest; loan never amortizes
    if (principal > bwBalance) principal = bwBalance;
    bwBalance = Math.max(0, bwBalance - principal);
    biweeklyInterest += interest;
    if (periods % 26 === 0) biweeklyYearEnd.push(bwBalance);
  }
  // Ensure the final (partial) year balance of 0 is captured.
  if (bwBalance <= 0 && periods % 26 !== 0) biweeklyYearEnd.push(0);

  const biweeklyPayoffYears = periods / 26;

  // Build a combined yearly schedule. Use the longer of the two plans so both
  // lines span the full chart; once paid off, the balance stays at 0.
  const totalYears = Math.max(monthlyYearEnd.length, biweeklyYearEnd.length) - 1;
  const schedule: BiweeklyYearPoint[] = [];
  for (let yr = 0; yr <= totalYears; yr++) {
    const monthlyBalance = yr < monthlyYearEnd.length ? monthlyYearEnd[yr] : 0;
    const biweeklyBalance = yr < biweeklyYearEnd.length ? biweeklyYearEnd[yr] : 0;
    schedule.push({ year: yr, monthlyBalance, biweeklyBalance });
  }

  const interestSaved = monthlyInterest - biweeklyInterest;
  const monthsSaved = Math.max(0, Math.round((termYears - biweeklyPayoffYears) * 12));

  return {
    loanAmount,
    monthlyPayment,
    biweeklyPayment,
    monthlyTotalInterest: monthlyInterest,
    biweeklyTotalInterest: biweeklyInterest,
    interestSaved,
    monthlyPayoffYears: termYears,
    biweeklyPayoffYears,
    monthsSaved,
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

// Express a number of whole months as "X yr Y mo" for readable time savings.
export function formatMonths(months: number): string {
  const m = Math.max(0, Math.round(months));
  const yr = Math.floor(m / 12);
  const mo = m % 12;
  if (yr > 0 && mo > 0) return `${yr} yr ${mo} mo`;
  if (yr > 0) return `${yr} yr`;
  return `${mo} mo`;
}
