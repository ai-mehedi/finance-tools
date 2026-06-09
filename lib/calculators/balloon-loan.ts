// Pure logic for the Balloon Loan Calculator.
// A balloon loan is amortized over a long schedule (amortYears) but comes due
// after a shorter term (balloonYears), leaving a large lump-sum balloon
// payment. The monthly payment uses the standard amortizing loan formula, and
// the balloon is the remaining balance at the end of the term.

export interface BalloonLoanInput {
  loanAmount: number;
  annualRatePct: number;
  amortYears: number; // schedule the payment is based on (e.g. 30)
  balloonYears: number; // when the loan actually comes due (e.g. 7)
}

export interface BalloonYearPoint {
  year: number;
  balance: number;
}

export interface BalloonLoanResult {
  monthlyPayment: number;
  balloonPayment: number; // remaining balance due at the end of the term
  totalPaidBeforeBalloon: number; // sum of the monthly payments
  totalInterest: number; // interest paid over the term, before the balloon
  totalCost: number; // monthly payments + balloon
  balloonMonths: number;
  schedule: BalloonYearPoint[];
}

export function computeBalloonLoan(input: BalloonLoanInput): BalloonLoanResult | null {
  const { loanAmount, annualRatePct, amortYears, balloonYears } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(amortYears) || amortYears <= 0) return null;
  if (!Number.isFinite(balloonYears) || balloonYears <= 0) return null;
  if (annualRatePct < 0) return null;
  if (balloonYears > amortYears) return null;

  const r = annualRatePct / 100 / 12;
  const nAmort = Math.round(amortYears * 12);
  const nBalloon = Math.round(balloonYears * 12);

  const monthlyPayment =
    r > 0
      ? (loanAmount * r * Math.pow(1 + r, nAmort)) / (Math.pow(1 + r, nAmort) - 1)
      : loanAmount / nAmort;

  let balance = loanAmount;
  let cumInterest = 0;
  const schedule: BalloonYearPoint[] = [{ year: 0, balance: loanAmount }];

  for (let m = 1; m <= nBalloon; m++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance = Math.max(0, balance - principal);
    cumInterest += interest;
    if (m % 12 === 0 || m === nBalloon) {
      schedule.push({ year: m / 12, balance });
    }
  }

  const balloonPayment = balance;
  const totalPaidBeforeBalloon = monthlyPayment * nBalloon;
  const totalInterest = cumInterest;
  const totalCost = totalPaidBeforeBalloon + balloonPayment;

  return {
    monthlyPayment,
    balloonPayment,
    totalPaidBeforeBalloon,
    totalInterest,
    totalCost,
    balloonMonths: nBalloon,
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
