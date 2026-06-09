// Pure logic for the Annual Fee Worth It Calculator.
// Compares the rewards and perks a card earns in a year against its annual fee
// to show whether the card pays for itself. No time series, so no chart.

export interface AnnualFeeInput {
  annualFee: number;
  monthlySpend: number;
  rewardRatePct: number; // average percent back across spending
  perksValue: number; // dollar value of credits and perks used per year
  signupBonus: number; // first-year only bonus value, in dollars
}

export interface AnnualFeeResult {
  annualSpend: number;
  rewardsEarned: number;
  perksValue: number;
  grossValueOngoing: number; // rewards + perks, excluding signup bonus
  netValueOngoing: number; // grossValueOngoing - annualFee
  netValueFirstYear: number; // includes signup bonus
  breakEvenSpend: number | null; // annual spend needed to cover the fee from rewards alone
  worthIt: boolean; // ongoing net value is positive
}

export function computeAnnualFee(input: AnnualFeeInput): AnnualFeeResult | null {
  const { annualFee, monthlySpend, rewardRatePct, perksValue, signupBonus } = input;

  if (!Number.isFinite(annualFee) || annualFee < 0) return null;
  if (monthlySpend < 0 || rewardRatePct < 0 || perksValue < 0 || signupBonus < 0) return null;
  if (!Number.isFinite(monthlySpend) || !Number.isFinite(rewardRatePct)) return null;

  const annualSpend = monthlySpend * 12;
  const rate = rewardRatePct / 100;
  const rewardsEarned = annualSpend * rate;
  const grossValueOngoing = rewardsEarned + perksValue;
  const netValueOngoing = grossValueOngoing - annualFee;
  const netValueFirstYear = netValueOngoing + signupBonus;

  // Spend needed so rewards alone cover the fee, after perks are applied.
  const feeAfterPerks = Math.max(0, annualFee - perksValue);
  const breakEvenSpend = rate > 0 ? feeAfterPerks / rate : null;

  return {
    annualSpend,
    rewardsEarned,
    perksValue,
    grossValueOngoing,
    netValueOngoing,
    netValueFirstYear,
    breakEvenSpend,
    worthIt: netValueOngoing >= 0,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number): string => usd.format(Number.isFinite(n) ? n : 0);
