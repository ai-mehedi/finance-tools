// Pure logic for the Line of Credit Calculator.
// Models a fixed draw on a revolving line with a variable annual rate, paid down
// by a fixed monthly payment, and builds a monthly schedule for charting.

export interface LineOfCreditInput {
  drawAmount: number; // amount borrowed against the line
  annualRatePct: number;
  monthlyPayment: number; // fixed payment you intend to make
}

export interface LineOfCreditMonthPoint {
  month: number;
  balance: number;
  interestPaid: number; // cumulative interest paid so far
}

export interface LineOfCreditResult {
  monthlyInterestFirst: number; // interest portion of the first payment
  minimumPayment: number; // payment needed to cover at least the first month interest
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  feasible: boolean; // false if the payment never reduces the balance
  schedule: LineOfCreditMonthPoint[];
}

const MAX_MONTHS = 1200; // 100 year safety cap

export function computeLineOfCredit(input: LineOfCreditInput): LineOfCreditResult | null {
  const { drawAmount, annualRatePct, monthlyPayment } = input;

  if (!Number.isFinite(drawAmount) || drawAmount <= 0) return null;
  if (annualRatePct < 0 || monthlyPayment <= 0) return null;

  const r = annualRatePct / 100 / 12;
  const monthlyInterestFirst = drawAmount * r;
  // A payment must exceed the first month interest, or the balance never falls.
  const minimumPayment = monthlyInterestFirst;

  if (monthlyPayment <= monthlyInterestFirst && r > 0) {
    return {
      monthlyInterestFirst,
      minimumPayment,
      monthsToPayoff: 0,
      totalInterest: 0,
      totalPaid: 0,
      feasible: false,
      schedule: [{ month: 0, balance: drawAmount, interestPaid: 0 }],
    };
  }

  let balance = drawAmount;
  let cumInterest = 0;
  let month = 0;
  const schedule: LineOfCreditMonthPoint[] = [
    { month: 0, balance: drawAmount, interestPaid: 0 },
  ];

  while (balance > 0 && month < MAX_MONTHS) {
    month++;
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance; // final payment guard
    balance = Math.max(0, balance - principal);
    cumInterest += interest;
    schedule.push({ month, balance, interestPaid: cumInterest });
  }

  const totalInterest = cumInterest;
  const totalPaid = drawAmount + totalInterest;

  return {
    monthlyInterestFirst,
    minimumPayment,
    monthsToPayoff: month,
    totalInterest,
    totalPaid,
    feasible: true,
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

export function formatMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (rem > 0) parts.push(`${rem} ${rem === 1 ? "month" : "months"}`);
  return parts.join(" ");
}
