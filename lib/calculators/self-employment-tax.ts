// Pure logic for the Self Employment Tax Calculator.
// Self-employment (SE) tax is the self-employed person's share of Social Security
// and Medicare. Only 92.35% of net profit is subject to SE tax (the "net earnings
// from self-employment" adjustment). Social Security applies at 12.4% up to an
// annual wage base; Medicare applies at 2.9% on all net earnings, plus an extra
// 0.9% Additional Medicare Tax above a filing-status threshold. Half of the SE
// tax is deductible against income tax. Defaults reflect 2024 figures and can be
// overridden by the caller so the math stays current.

export type FilingStatus = "single" | "married" | "marriedSeparate" | "headOfHousehold";

export interface SeTaxConstants {
  netEarningsFactor: number; // 0.9235
  socialSecurityRate: number; // 0.124
  medicareRate: number; // 0.029
  additionalMedicareRate: number; // 0.009
  socialSecurityWageBase: number; // 2024: 168600
  additionalMedicareThreshold: Record<FilingStatus, number>;
}

export const SE_DEFAULTS: SeTaxConstants = {
  netEarningsFactor: 0.9235,
  socialSecurityRate: 0.124,
  medicareRate: 0.029,
  additionalMedicareRate: 0.009,
  socialSecurityWageBase: 168600,
  additionalMedicareThreshold: {
    single: 200000,
    married: 250000,
    marriedSeparate: 125000,
    headOfHousehold: 200000,
  },
};

export interface SelfEmploymentTaxInput {
  netProfit: number; // net profit from Schedule C
  w2SocialSecurityWages: number; // wages already subject to SS tax this year
  filingStatus: FilingStatus;
  constants?: SeTaxConstants;
}

export interface SelfEmploymentTaxResult {
  netEarnings: number; // 92.35% of net profit
  socialSecurityTax: number;
  medicareTax: number; // base 2.9% portion
  additionalMedicareTax: number; // extra 0.9% portion
  totalSeTax: number;
  deductibleHalf: number; // half of SE tax, deductible against income tax
  effectiveRatePct: number; // SE tax as a share of net profit
  // For charting: how the total tax splits across the three components.
  breakdown: { label: string; value: number }[];
}

export function computeSelfEmploymentTax(
  input: SelfEmploymentTaxInput
): SelfEmploymentTaxResult | null {
  const { netProfit, w2SocialSecurityWages, filingStatus } = input;
  const c = input.constants ?? SE_DEFAULTS;

  if (!Number.isFinite(netProfit)) return null;
  if (netProfit < 0) return null;
  if (!Number.isFinite(w2SocialSecurityWages) || w2SocialSecurityWages < 0) return null;

  const netEarnings = netProfit * c.netEarningsFactor;

  // Below roughly $434/yr of net earnings no SE tax is owed; below the floor the
  // tax is simply zero.
  if (netEarnings < 400) {
    return {
      netEarnings,
      socialSecurityTax: 0,
      medicareTax: 0,
      additionalMedicareTax: 0,
      totalSeTax: 0,
      deductibleHalf: 0,
      effectiveRatePct: 0,
      breakdown: [
        { label: "Social Security", value: 0 },
        { label: "Medicare", value: 0 },
        { label: "Additional Medicare", value: 0 },
      ],
    };
  }

  // Social Security portion: only the wage base not already used by W-2 wages.
  const ssBaseRemaining = Math.max(0, c.socialSecurityWageBase - w2SocialSecurityWages);
  const ssTaxable = Math.min(netEarnings, ssBaseRemaining);
  const socialSecurityTax = ssTaxable * c.socialSecurityRate;

  // Medicare base portion: all net earnings, no cap.
  const medicareTax = netEarnings * c.medicareRate;

  // Additional Medicare Tax: 0.9% on combined wages plus net earnings above the
  // filing-status threshold. Only the self-employment slice is part of SE tax.
  const threshold = c.additionalMedicareThreshold[filingStatus];
  const combined = w2SocialSecurityWages + netEarnings;
  const overThreshold = Math.max(0, combined - threshold);
  const additionalMedicareTax =
    Math.min(overThreshold, netEarnings) * c.additionalMedicareRate;

  const totalSeTax = socialSecurityTax + medicareTax + additionalMedicareTax;
  const deductibleHalf =
    (socialSecurityTax + medicareTax) / 2; // standard half-SE-tax deduction (base components)
  const effectiveRatePct = netProfit > 0 ? (totalSeTax / netProfit) * 100 : 0;

  return {
    netEarnings,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    totalSeTax,
    deductibleHalf,
    effectiveRatePct,
    breakdown: [
      { label: "Social Security", value: socialSecurityTax },
      { label: "Medicare", value: medicareTax },
      { label: "Additional Medicare", value: additionalMedicareTax },
    ],
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
