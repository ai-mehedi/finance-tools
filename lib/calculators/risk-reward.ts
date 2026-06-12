// Pure logic for the Risk Reward Ratio Calculator.
// Given an entry price, a stop-loss and a take-profit target, it computes the
// risk per share (entry to stop), the reward per share (entry to target), the
// risk/reward ratio and the break-even win rate needed for the trade to be
// profitable over many repetitions. It also sizes the position from the
// account balance and the percentage of capital risked.
//
// Works for both long trades (target above entry, stop below) and short trades
// (target below entry, stop above); direction is detected automatically.

export interface RiskRewardInput {
  entry: number;
  stop: number;
  target: number;
  accountSize: number;
  riskPercent: number; // percent of account risked on this trade
}

export interface RiskRewardScenario {
  winRate: number; // percent
  expectancy: number; // expected $ per trade at this win rate
}

export interface RiskRewardResult {
  direction: "long" | "short";
  riskPerShare: number;
  rewardPerShare: number;
  riskRewardRatio: number; // reward divided by risk
  rMultiple: number; // same as ratio, expressed as R
  breakevenWinRate: number; // percent win rate needed to break even
  riskAmount: number; // dollars risked
  shares: number; // position size in shares/units
  positionValue: number; // entry price times shares
  maxLoss: number; // dollars lost if stop is hit
  maxGain: number; // dollars gained if target is hit
  scenarios: RiskRewardScenario[]; // expectancy across win rates for charting
}

export function computeRiskReward(input: RiskRewardInput): RiskRewardResult | null {
  const { entry, stop, target, accountSize, riskPercent } = input;

  if (![entry, stop, target].every((v) => Number.isFinite(v) && v > 0)) return null;
  if (stop === entry || target === entry) return null;

  // Direction: a long has its stop below entry; a short has its stop above.
  const direction: "long" | "short" = stop < entry ? "long" : "short";

  const riskPerShare = Math.abs(entry - stop);
  const rewardPerShare = Math.abs(target - entry);

  // Sanity: target and stop must sit on opposite sides of entry.
  if (direction === "long" && target <= entry) return null;
  if (direction === "short" && target >= entry) return null;

  const riskRewardRatio = rewardPerShare / riskPerShare;
  const rMultiple = riskRewardRatio;

  // Break-even win rate for a fixed-ratio system: 1 / (1 + reward/risk).
  const breakevenWinRate = (1 / (1 + riskRewardRatio)) * 100;

  const riskAmount =
    Number.isFinite(accountSize) && Number.isFinite(riskPercent) && accountSize > 0
      ? accountSize * (riskPercent / 100)
      : 0;
  const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const positionValue = shares * entry;
  const maxLoss = shares * riskPerShare;
  const maxGain = shares * rewardPerShare;

  // Expectancy across a band of win rates for the chart. Expectancy per trade =
  // winRate * reward - lossRate * risk, scaled to dollars at risk per trade.
  const perTradeRisk = riskAmount > 0 ? riskAmount : riskPerShare;
  const scenarios: RiskRewardScenario[] = [];
  for (let w = 10; w <= 90; w += 10) {
    const p = w / 100;
    const expectancy = p * (perTradeRisk * riskRewardRatio) - (1 - p) * perTradeRisk;
    scenarios.push({ winRate: w, expectancy });
  }

  return {
    direction,
    riskPerShare,
    rewardPerShare,
    riskRewardRatio,
    rMultiple,
    breakevenWinRate,
    riskAmount,
    shares,
    positionValue,
    maxLoss,
    maxGain,
    scenarios,
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
