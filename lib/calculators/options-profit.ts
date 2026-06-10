// Pure logic for the Options Profit Calculator.
// Models the profit and loss at expiration for a single-leg options position
// (long/short call or put). Builds a per-price payoff schedule for charting and
// reports breakeven, max gain and max loss.

export type OptionType = "call" | "put";
export type Side = "long" | "short";

export interface OptionsProfitInput {
  optionType: OptionType;
  side: Side;
  strike: number;
  premium: number; // per share
  contracts: number;
  contractSize: number; // shares per contract, usually 100
  spotAtExpiry: number; // underlying price to evaluate the current P/L
}

export interface PayoffPoint {
  price: number; // underlying price at expiration
  profit: number; // total dollar profit for the whole position
}

export interface OptionsProfitResult {
  shares: number; // contracts times contract size
  costBasis: number; // total premium paid (long) or received (short)
  intrinsicAtSpot: number; // intrinsic value per share at the chosen spot
  profitAtSpot: number; // total dollar P/L at the chosen spot
  breakeven: number; // underlying price where P/L is zero
  maxProfit: number | null; // null means unlimited
  maxLoss: number | null; // null means unlimited
  schedule: PayoffPoint[];
}

// Intrinsic value per share of one option at a given underlying price.
function intrinsic(optionType: OptionType, strike: number, price: number): number {
  return optionType === "call"
    ? Math.max(0, price - strike)
    : Math.max(0, strike - price);
}

export function computeOptionsProfit(input: OptionsProfitInput): OptionsProfitResult | null {
  const { optionType, side, strike, premium, contracts, contractSize, spotAtExpiry } = input;

  if (!Number.isFinite(strike) || strike <= 0) return null;
  if (!Number.isFinite(premium) || premium < 0) return null;
  if (!Number.isFinite(contracts) || contracts <= 0) return null;
  if (!Number.isFinite(contractSize) || contractSize <= 0) return null;
  if (!Number.isFinite(spotAtExpiry) || spotAtExpiry < 0) return null;

  const shares = contracts * contractSize;
  const sign = side === "long" ? 1 : -1;
  const costBasis = premium * shares; // magnitude of premium exchanged

  // Per-share profit at a given underlying price.
  // Long: pay premium, gain intrinsic. Short: receive premium, owe intrinsic.
  const profitPerShare = (price: number) =>
    sign * (intrinsic(optionType, strike, price) - premium);

  const totalProfit = (price: number) => profitPerShare(price) * shares;

  const intrinsicAtSpot = intrinsic(optionType, strike, spotAtExpiry);
  const profitAtSpot = totalProfit(spotAtExpiry);

  // Breakeven: strike adjusted by premium in the option's direction.
  const breakeven =
    optionType === "call" ? strike + premium : Math.max(0, strike - premium);

  // Max gain / max loss for a single leg.
  let maxProfit: number | null;
  let maxLoss: number | null;
  if (side === "long") {
    // Long: most you can lose is the premium.
    maxLoss = -costBasis;
    // Long call upside is unlimited; long put caps when price hits zero.
    maxProfit = optionType === "call" ? null : (strike - premium) * shares;
  } else {
    // Short: most you can make is the premium collected.
    maxProfit = costBasis;
    // Short call loss is unlimited; short put caps when price hits zero.
    maxLoss = optionType === "call" ? null : -(strike - premium) * shares;
  }

  // Build a payoff curve centred on the strike so the kink is visible.
  const center = strike;
  const span = Math.max(strike * 0.6, premium * 4, 1);
  const lo = Math.max(0, center - span);
  const hi = center + span;
  const steps = 60;
  const schedule: PayoffPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = lo + ((hi - lo) * i) / steps;
    schedule.push({ price, profit: totalProfit(price) });
  }

  return {
    shares,
    costBasis,
    intrinsicAtSpot,
    profitAtSpot,
    breakeven,
    maxProfit,
    maxLoss,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
