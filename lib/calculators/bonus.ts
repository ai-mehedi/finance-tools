// Pure logic for the Bonus Calculator.
// Estimates take-home pay on a bonus using the IRS flat supplemental wage
// method: federal tax is withheld at a flat rate, plus optional state tax and
// FICA (Social Security and Medicare).

export interface BonusInput {
  bonusAmount: number;
  federalRatePct: number; // flat supplemental federal rate, default 22%
  stateRatePct: number; // optional state supplemental rate
  includeFica: boolean; // apply Social Security + Medicare
}

export interface BonusResult {
  gross: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalWithheld: number;
  netBonus: number;
  effectiveRatePct: number;
}

// 2024-2025 FICA rates on the employee side.
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;

export function computeBonus(input: BonusInput): BonusResult | null {
  const { bonusAmount, federalRatePct, stateRatePct, includeFica } = input;

  if (!Number.isFinite(bonusAmount) || bonusAmount <= 0) return null;
  if (federalRatePct < 0 || stateRatePct < 0) return null;

  const gross = bonusAmount;
  const federalTax = gross * (federalRatePct / 100);
  const stateTax = gross * (stateRatePct / 100);
  const socialSecurity = includeFica ? gross * SS_RATE : 0;
  const medicare = includeFica ? gross * MEDICARE_RATE : 0;

  const totalWithheld = federalTax + stateTax + socialSecurity + medicare;
  const netBonus = gross - totalWithheld;
  const effectiveRatePct = gross > 0 ? (totalWithheld / gross) * 100 : 0;

  return {
    gross,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalWithheld,
    netBonus,
    effectiveRatePct,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
