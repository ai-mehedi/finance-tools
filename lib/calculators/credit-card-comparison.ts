// Pure logic for the Credit Card Comparison Calculator.
// Compares two cards by the real annual cost of carrying a balance: interest
// charged on the average balance over a year plus the annual fee, minus any
// flat rewards you earn. The card with the lower net annual cost wins.

export interface CardInput {
  name: string;
  aprPct: number; // purchase APR
  annualFee: number;
  rewardsRatePct: number; // cash back / rewards rate on spend
}

export interface ComparisonInput {
  avgBalance: number; // average balance you carry month to month
  annualSpend: number; // amount you put on the card each year
  cardA: CardInput;
  cardB: CardInput;
}

export interface CardCost {
  name: string;
  interestCost: number;
  annualFee: number;
  rewardsEarned: number;
  netAnnualCost: number; // interest + fee - rewards
}

export interface ComparisonResult {
  a: CardCost;
  b: CardCost;
  cheaperName: string;
  annualSavings: number; // positive savings of the cheaper card vs the other
}

function costForCard(card: CardInput, avgBalance: number, annualSpend: number): CardCost {
  const interestCost = avgBalance * (card.aprPct / 100);
  const rewardsEarned = annualSpend * (card.rewardsRatePct / 100);
  const netAnnualCost = interestCost + card.annualFee - rewardsEarned;
  return {
    name: card.name,
    interestCost,
    annualFee: card.annualFee,
    rewardsEarned,
    netAnnualCost,
  };
}

export function computeCardComparison(input: ComparisonInput): ComparisonResult | null {
  const { avgBalance, annualSpend, cardA, cardB } = input;

  if (!Number.isFinite(avgBalance) || avgBalance < 0) return null;
  if (!Number.isFinite(annualSpend) || annualSpend < 0) return null;
  if (cardA.aprPct < 0 || cardB.aprPct < 0) return null;
  if (cardA.annualFee < 0 || cardB.annualFee < 0) return null;
  if (cardA.rewardsRatePct < 0 || cardB.rewardsRatePct < 0) return null;

  const a = costForCard(cardA, avgBalance, annualSpend);
  const b = costForCard(cardB, avgBalance, annualSpend);

  const aWins = a.netAnnualCost <= b.netAnnualCost;
  const cheaperName = aWins ? a.name : b.name;
  const annualSavings = Math.abs(a.netAnnualCost - b.netAnnualCost);

  return { a, b, cheaperName, annualSavings };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
