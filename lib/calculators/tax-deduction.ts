// Pure logic for the Tax Deduction Calculator.
// Compares the 2024 standard deduction against the user's itemized deductions
// (mortgage interest, state and local taxes capped at the SALT limit, charitable
// gifts, medical above the AGI floor) and estimates the federal tax saved by the
// larger deduction at the user's marginal rate. Returns a comparison schedule
// for charting standard versus itemized.

export type FilingStatus = "single" | "married" | "head";

export const STATUS_LABEL: Record<FilingStatus, string> = {
  single: "Single",
  married: "Married filing jointly",
  head: "Head of household",
};

// 2024 standard deduction amounts.
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  head: 21900,
};

// State and local tax (SALT) deduction cap.
const SALT_CAP = 10000;
// Medical expenses are deductible only above 7.5 percent of AGI.
const MEDICAL_AGI_FLOOR = 0.075;

export interface TaxDeductionInput {
  agi: number; // adjusted gross income
  filingStatus: FilingStatus;
  marginalRatePct: number; // user's top bracket, e.g. 22
  mortgageInterest: number;
  stateLocalTaxes: number; // property + state income/sales, before the cap
  charitable: number;
  medical: number; // total qualified medical expenses
}

export interface DeductionItem {
  label: string;
  value: number; // allowed amount after caps/floors
  color: string;
}

export interface TaxDeductionResult {
  standardDeduction: number;
  itemizedTotal: number;
  saltAllowed: number;
  medicalAllowed: number;
  recommended: "standard" | "itemized";
  deductionUsed: number;
  extraOverStandard: number; // itemized minus standard, if positive
  taxSavingsVsItemizing: number; // tax saved by taking the larger deduction over the smaller
  estimatedTaxSaved: number; // deductionUsed times marginal rate
  items: DeductionItem[];
}

export function computeTaxDeduction(input: TaxDeductionInput): TaxDeductionResult | null {
  const { agi, filingStatus, marginalRatePct, mortgageInterest, stateLocalTaxes, charitable, medical } = input;

  if (!Number.isFinite(agi) || agi < 0) return null;
  if (!STANDARD_DEDUCTION[filingStatus]) return null;
  if (!Number.isFinite(marginalRatePct) || marginalRatePct < 0) return null;
  const vals = [mortgageInterest, stateLocalTaxes, charitable, medical];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) return null;

  const standardDeduction = STANDARD_DEDUCTION[filingStatus];
  const rate = marginalRatePct / 100;

  const saltAllowed = Math.min(stateLocalTaxes, SALT_CAP);
  const medicalAllowed = Math.max(0, medical - agi * MEDICAL_AGI_FLOOR);

  const itemizedTotal = mortgageInterest + saltAllowed + charitable + medicalAllowed;

  const recommended: "standard" | "itemized" = itemizedTotal > standardDeduction ? "itemized" : "standard";
  const deductionUsed = Math.max(standardDeduction, itemizedTotal);
  const extraOverStandard = Math.max(0, itemizedTotal - standardDeduction);

  // Tax saved by taking the larger of the two deductions instead of the smaller.
  const taxSavingsVsItemizing = Math.abs(itemizedTotal - standardDeduction) * rate;
  const estimatedTaxSaved = deductionUsed * rate;

  const items: DeductionItem[] = [
    { label: "Mortgage interest", value: mortgageInterest, color: "#f97316" },
    { label: "State & local taxes (capped)", value: saltAllowed, color: "#fb923c" },
    { label: "Charitable gifts", value: charitable, color: "#fcd34d" },
    { label: "Medical above floor", value: medicalAllowed, color: "#a1a1aa" },
  ].filter((i) => i.value > 0.5);

  return {
    standardDeduction,
    itemizedTotal,
    saltAllowed,
    medicalAllowed,
    recommended,
    deductionUsed,
    extraOverStandard,
    taxSavingsVsItemizing,
    estimatedTaxSaved,
    items,
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
