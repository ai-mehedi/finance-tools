// Pure logic for the Estate Tax Calculator.
// Estimates U.S. federal estate tax. The taxable estate is the gross estate
// minus deductions (debts, expenses, charitable and spousal transfers). Tax
// applies only to the portion of the taxable estate above the lifetime
// exclusion, at a flat top federal rate of 40 percent (a close approximation of
// the graduated table at large estate sizes). Exposes a per-band schedule for a
// simple bar chart of estate composition.

export interface EstateTaxInput {
  grossEstate: number;
  debtsAndExpenses: number;
  charitableBequests: number;
  maritalDeduction: number;
  exclusion: number; // lifetime exemption available
  ratePct: number; // top federal rate, default 40
}

export interface EstateBand {
  label: string;
  value: number;
  color: string;
}

export interface EstateTaxResult {
  grossEstate: number;
  totalDeductions: number;
  taxableEstate: number; // gross minus deductions
  exclusionUsed: number;
  amountAboveExclusion: number;
  estateTax: number;
  netToHeirs: number; // taxable estate minus tax (charitable/marital already removed)
  effectiveRatePct: number; // tax as a share of the gross estate
  bands: EstateBand[];
}

export function computeEstateTax(input: EstateTaxInput): EstateTaxResult | null {
  const {
    grossEstate,
    debtsAndExpenses,
    charitableBequests,
    maritalDeduction,
    exclusion,
    ratePct,
  } = input;

  if (!Number.isFinite(grossEstate) || grossEstate <= 0) return null;
  if (!Number.isFinite(ratePct) || ratePct < 0) return null;

  const debts = Math.max(0, debtsAndExpenses || 0);
  const charitable = Math.max(0, charitableBequests || 0);
  const marital = Math.max(0, maritalDeduction || 0);
  const excl = Math.max(0, exclusion || 0);
  const rate = ratePct / 100;

  const totalDeductions = debts + charitable + marital;
  const taxableEstate = Math.max(0, grossEstate - totalDeductions);

  const exclusionUsed = Math.min(taxableEstate, excl);
  const amountAboveExclusion = Math.max(0, taxableEstate - excl);
  const estateTax = amountAboveExclusion * rate;

  const netToHeirs = Math.max(0, taxableEstate - estateTax);
  const effectiveRatePct = (estateTax / grossEstate) * 100;

  const bands: EstateBand[] = [
    { label: "Deductions", value: totalDeductions, color: "bg-zinc-300" },
    { label: "Sheltered by exclusion", value: exclusionUsed, color: "bg-orange-300" },
    { label: "Taxable above exclusion", value: amountAboveExclusion, color: "bg-orange-500" },
  ];

  return {
    grossEstate,
    totalDeductions,
    taxableEstate,
    exclusionUsed,
    amountAboveExclusion,
    estateTax,
    netToHeirs,
    effectiveRatePct,
    bands,
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
