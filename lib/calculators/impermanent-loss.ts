// Pure logic for the Impermanent Loss Calculator.
// Models a classic 50/50 constant-product (x*y=k) liquidity pool such as
// Uniswap v2. When the price ratio of the two assets changes after you deposit,
// the pool rebalances and your position is worth less than simply holding the
// two assets — that shortfall is "impermanent loss" (IL).
//
// The closed-form IL for a price ratio change of factor k (new price / old
// price of the volatile asset measured in the other asset) is:
//   IL = 2 * sqrt(k) / (1 + k) - 1   (a negative number, e.g. -0.057 = -5.7%)
// We also reconstruct the dollar value of the LP position versus holding so the
// user sees real amounts, plus a curve of IL across a range of price moves.

export interface ImpermanentLossInput {
  amountA: string; // not used numerically here; kept for clarity in UI mapping
}

export interface ImpermanentLossParams {
  initialPriceA: number; // price of token A in USD at deposit
  initialPriceB: number; // price of token B in USD at deposit
  futurePriceA: number; // price of token A in USD now/later
  futurePriceB: number; // price of token B in USD now/later
  depositUSD: number; // total USD value deposited (split 50/50)
}

export interface ILCurvePoint {
  changePct: number; // % change in relative price of A vs B
  ilPct: number; // impermanent loss at that change (negative %)
}

export interface ImpermanentLossResult {
  ilPct: number; // impermanent loss as a percent (negative)
  ilUSD: number; // dollar amount lost vs holding (negative)
  hodlValue: number; // USD value if you had just held the two tokens
  lpValue: number; // USD value of the LP position (excludes fees)
  priceRatioChange: number; // k = relative price factor
  relativeChangePct: number; // % change in A's price relative to B
  curve: ILCurvePoint[];
}

// IL for a given relative price factor k (>0). Returns a value in [-1, 0].
export function impermanentLossForRatio(k: number): number {
  if (!Number.isFinite(k) || k <= 0) return 0;
  return (2 * Math.sqrt(k)) / (1 + k) - 1;
}

export function computeImpermanentLoss(
  p: ImpermanentLossParams
): ImpermanentLossResult | null {
  const { initialPriceA, initialPriceB, futurePriceA, futurePriceB, depositUSD } = p;

  if (
    !(initialPriceA > 0) ||
    !(initialPriceB > 0) ||
    !(futurePriceA > 0) ||
    !(futurePriceB > 0)
  )
    return null;
  if (!(depositUSD > 0)) return null;

  // Relative price of A measured in units of B.
  const relInitial = initialPriceA / initialPriceB;
  const relFuture = futurePriceA / futurePriceB;
  const k = relFuture / relInitial;

  const ilFraction = impermanentLossForRatio(k); // negative or 0

  // Deposit split 50/50 by USD value.
  const halfUSD = depositUSD / 2;
  const qtyA = halfUSD / initialPriceA;
  const qtyB = halfUSD / initialPriceB;

  // HODL value: just keep the original token quantities, revalue at new prices.
  const hodlValue = qtyA * futurePriceA + qtyB * futurePriceB;

  // LP value = HODL value * (1 + IL). IL is negative, so LP <= HODL.
  const lpValue = hodlValue * (1 + ilFraction);
  const ilUSD = lpValue - hodlValue;

  // Curve across a range of relative price changes (-90% to +400%).
  const curve: ILCurvePoint[] = [];
  for (let pct = -90; pct <= 400; pct += 10) {
    const factor = 1 + pct / 100;
    curve.push({ changePct: pct, ilPct: impermanentLossForRatio(factor) * 100 });
  }

  return {
    ilPct: ilFraction * 100,
    ilUSD,
    hodlValue,
    lpValue,
    priceRatioChange: k,
    relativeChangePct: (k - 1) * 100,
    curve,
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
