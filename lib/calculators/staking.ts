// Pure logic for the Staking Rewards Calculator.
// Projects crypto staking rewards over time from a stake amount, an annual
// percentage rate, and a compounding (reward restaking) frequency. Returns a
// per-period schedule of token balance for charting, with optional USD values.

export type Compounding = "none" | "daily" | "weekly" | "monthly";

export const COMPOUNDS_PER_YEAR: Record<Compounding, number> = {
  none: 0, // simple, rewards not restaked
  daily: 365,
  weekly: 52,
  monthly: 12,
};

export interface StakingInput {
  stakeTokens: number; // amount of tokens staked
  apyPct: number; // advertised annual percentage rate / yield
  years: number; // staking horizon
  compounding: Compounding; // how often rewards are restaked
  tokenPriceUsd: number; // optional price per token for USD figures (0 = ignore)
}

export interface StakingYearPoint {
  year: number;
  balance: number; // token balance at end of year
  rewards: number; // cumulative reward tokens earned so far
}

export interface StakingResult {
  initialTokens: number;
  finalTokens: number;
  rewardTokens: number; // tokens earned over the whole period
  effectiveApyPct: number; // realised annual yield after compounding
  initialUsd: number;
  finalUsd: number;
  rewardUsd: number;
  schedule: StakingYearPoint[];
}

export function computeStaking(input: StakingInput): StakingResult | null {
  const { stakeTokens, apyPct, years, compounding, tokenPriceUsd } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(stakeTokens) || stakeTokens < 0) return null;
  if (!Number.isFinite(apyPct)) return null;
  if (!Number.isFinite(tokenPriceUsd) || tokenPriceUsd < 0) return null;

  const r = apyPct / 100;
  const n = COMPOUNDS_PER_YEAR[compounding];

  // Per-period growth factor and effective annual yield.
  let perYearFactor: number;
  let effectiveApyPct: number;
  if (n === 0) {
    perYearFactor = 1 + r; // simple: each year adds r * initial; modelled below
    effectiveApyPct = apyPct;
  } else {
    perYearFactor = Math.pow(1 + r / n, n);
    effectiveApyPct = (perYearFactor - 1) * 100;
  }

  const schedule: StakingYearPoint[] = [
    { year: 0, balance: stakeTokens, rewards: 0 },
  ];

  const wholeYears = Math.max(1, Math.round(years));
  let balance = stakeTokens;

  for (let yr = 1; yr <= wholeYears; yr++) {
    if (n === 0) {
      // Simple interest: rewards based on original stake, not restaked.
      balance = stakeTokens * (1 + r * yr);
    } else {
      balance = balance * perYearFactor;
    }
    schedule.push({
      year: yr,
      balance,
      rewards: balance - stakeTokens,
    });
  }

  const finalTokens = balance;
  const rewardTokens = finalTokens - stakeTokens;

  return {
    initialTokens: stakeTokens,
    finalTokens,
    rewardTokens,
    effectiveApyPct,
    initialUsd: stakeTokens * tokenPriceUsd,
    finalUsd: finalTokens * tokenPriceUsd,
    rewardUsd: rewardTokens * tokenPriceUsd,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const tokenFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
export const formatTokens = (n: number) => tokenFmt.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
