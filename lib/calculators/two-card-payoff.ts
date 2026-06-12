// Pure logic for the Two Card Payoff Calculator.
// You have two credit cards and a single fixed monthly budget. Each card gets at
// least its minimum payment; every spare dollar goes to one target card chosen by
// strategy (avalanche = highest APR first, snowball = lowest balance first). When
// the target card is cleared, its freed-up payment rolls onto the other card. The
// simulation runs month by month and returns a combined-balance schedule for
// charting plus the months-to-debt-free and total interest paid.

export type Strategy = "avalanche" | "snowball";

export interface CardInput {
  balance: number;
  aprPct: number; // annual percentage rate
  minPayment: number; // the card's fixed minimum dollar payment
}

export interface TwoCardPayoffInput {
  card1: CardInput;
  card2: CardInput;
  monthlyBudget: number; // total dollars available across both cards each month
  strategy: Strategy;
}

export interface PayoffMonthPoint {
  month: number;
  totalBalance: number;
  card1Balance: number;
  card2Balance: number;
}

export interface TwoCardPayoffResult {
  months: number; // months until both cards reach zero
  totalInterest: number;
  totalPaid: number;
  card1Months: number; // month each card is cleared (0 if never within cap)
  card2Months: number;
  schedule: PayoffMonthPoint[];
}

const MAX_MONTHS = 1200; // 100-year safety cap

export function computeTwoCardPayoff(input: TwoCardPayoffInput): TwoCardPayoffResult | null {
  const { card1, card2, monthlyBudget, strategy } = input;

  for (const c of [card1, card2]) {
    if (!Number.isFinite(c.balance) || c.balance < 0) return null;
    if (!Number.isFinite(c.aprPct) || c.aprPct < 0) return null;
    if (!Number.isFinite(c.minPayment) || c.minPayment < 0) return null;
  }
  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) return null;

  // The budget must at least cover both minimum payments, otherwise the balances
  // can grow forever. Require it to beat the combined minimums.
  const combinedMin = card1.minPayment + card2.minPayment;
  if (monthlyBudget < combinedMin) return null;

  let b1 = card1.balance;
  let b2 = card2.balance;
  const r1 = card1.aprPct / 100 / 12;
  const r2 = card2.aprPct / 100 / 12;

  let totalInterest = 0;
  let totalPaid = 0;
  let card1Months = 0;
  let card2Months = 0;

  const schedule: PayoffMonthPoint[] = [
    { month: 0, totalBalance: b1 + b2, card1Balance: b1, card2Balance: b2 },
  ];

  // Decide which card is the priority target at any moment.
  function targetIsCard1(): boolean {
    if (b1 <= 0) return false;
    if (b2 <= 0) return true;
    if (strategy === "avalanche") return card1.aprPct >= card2.aprPct;
    return b1 <= b2; // snowball: smallest balance first
  }

  let month = 0;
  while ((b1 > 0 || b2 > 0) && month < MAX_MONTHS) {
    month++;

    // 1) Accrue interest.
    const i1 = b1 > 0 ? b1 * r1 : 0;
    const i2 = b2 > 0 ? b2 * r2 : 0;
    b1 += i1;
    b2 += i2;
    totalInterest += i1 + i2;

    // 2) Pay each card its minimum (capped at the balance), tracking the spend.
    let budget = monthlyBudget;
    let pay1 = b1 > 0 ? Math.min(card1.minPayment, b1) : 0;
    let pay2 = b2 > 0 ? Math.min(card2.minPayment, b2) : 0;
    b1 -= pay1;
    b2 -= pay2;
    budget -= pay1 + pay2;

    // 3) Throw all remaining budget at the target card, then overflow to the other.
    if (budget > 0) {
      if (targetIsCard1() && b1 > 0) {
        const extra = Math.min(budget, b1);
        b1 -= extra;
        pay1 += extra;
        budget -= extra;
      } else if (b2 > 0) {
        const extra = Math.min(budget, b2);
        b2 -= extra;
        pay2 += extra;
        budget -= extra;
      }
      // Overflow onto whichever card still carries a balance.
      if (budget > 0 && b1 > 0) {
        const extra = Math.min(budget, b1);
        b1 -= extra;
        pay1 += extra;
        budget -= extra;
      }
      if (budget > 0 && b2 > 0) {
        const extra = Math.min(budget, b2);
        b2 -= extra;
        pay2 += extra;
        budget -= extra;
      }
    }

    totalPaid += pay1 + pay2;

    if (b1 <= 0 && card1Months === 0) card1Months = month;
    if (b2 <= 0 && card2Months === 0) card2Months = month;

    b1 = Math.max(0, b1);
    b2 = Math.max(0, b2);

    schedule.push({ month, totalBalance: b1 + b2, card1Balance: b1, card2Balance: b2 });
  }

  return {
    months: month,
    totalInterest,
    totalPaid,
    card1Months,
    card2Months,
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
