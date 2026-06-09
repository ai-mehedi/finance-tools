// Pure logic for the Credit Utilization Calculator.
// Credit utilization is the share of your available revolving credit you are
// using: total balances divided by total limits. Lenders also look at per-card
// utilization, so this also reports the highest single-card figure.

export interface UtilizationCard {
  balance: number;
  limit: number;
}

export interface CreditUtilizationInput {
  cards: UtilizationCard[];
}

export interface CreditUtilizationResult {
  totalBalance: number;
  totalLimit: number;
  overallUtilizationPct: number; // total balance / total limit * 100
  highestCardUtilizationPct: number; // worst single card
  availableCredit: number; // limit minus balance
  // To get overall utilization at or below 30%, how much you must pay down.
  payDownTo30: number;
  band: string; // Excellent / Good / Fair / High / Maxed
}

function bandFor(util: number): string {
  if (util <= 10) return "Excellent";
  if (util <= 30) return "Good";
  if (util <= 50) return "Fair";
  if (util < 100) return "High";
  return "Maxed out";
}

export function computeCreditUtilization(
  input: CreditUtilizationInput
): CreditUtilizationResult | null {
  const cards = input.cards.filter((c) => Number.isFinite(c.limit) && c.limit > 0);
  if (cards.length === 0) return null;
  for (const c of cards) {
    if (!Number.isFinite(c.balance) || c.balance < 0) return null;
  }

  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const overallUtilizationPct = (totalBalance / totalLimit) * 100;

  const highestCardUtilizationPct = cards.reduce(
    (max, c) => Math.max(max, (c.balance / c.limit) * 100),
    0
  );

  const availableCredit = Math.max(0, totalLimit - totalBalance);
  const payDownTo30 = Math.max(0, totalBalance - totalLimit * 0.3);

  return {
    totalBalance,
    totalLimit,
    overallUtilizationPct,
    highestCardUtilizationPct,
    availableCredit,
    payDownTo30,
    band: bandFor(overallUtilizationPct),
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
