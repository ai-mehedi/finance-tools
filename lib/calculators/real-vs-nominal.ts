// Pure logic for the Real vs Nominal Return Calculator.
// Converts a nominal (stated) return into a real (inflation-adjusted) return
// using the exact Fisher equation, and projects how a balance grows in
// nominal dollars versus real, today's-money dollars over a horizon.

export interface RealVsNominalInput {
  principal: number;
  nominalRatePct: number;
  inflationRatePct: number;
  years: number;
}

export interface RealVsNominalYearPoint {
  year: number;
  nominal: number; // balance in future dollars
  real: number; // balance expressed in today's purchasing power
}

export interface RealVsNominalResult {
  realRatePct: number; // exact Fisher real rate, in percent
  approxRealRatePct: number; // simple nominal minus inflation, for reference
  nominalFinal: number; // ending balance in future dollars
  realFinal: number; // ending balance in today's dollars
  purchasingPowerLoss: number; // nominalFinal minus realFinal
  schedule: RealVsNominalYearPoint[];
}

export function computeRealVsNominal(input: RealVsNominalInput): RealVsNominalResult | null {
  const { principal, nominalRatePct, inflationRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (principal < 0) return null;
  if (!Number.isFinite(nominalRatePct) || !Number.isFinite(inflationRatePct)) return null;
  if (inflationRatePct <= -100) return null;

  const nominal = nominalRatePct / 100;
  const inflation = inflationRatePct / 100;

  // Fisher equation: 1 + real = (1 + nominal) / (1 + inflation)
  const realRate = (1 + nominal) / (1 + inflation) - 1;

  const wholeYears = Math.max(1, Math.round(years));
  const schedule: RealVsNominalYearPoint[] = [
    { year: 0, nominal: principal, real: principal },
  ];

  for (let yr = 1; yr <= wholeYears; yr++) {
    const nominalBal = principal * Math.pow(1 + nominal, yr);
    const realBal = nominalBal / Math.pow(1 + inflation, yr);
    schedule.push({ year: yr, nominal: nominalBal, real: realBal });
  }

  const nominalFinal = principal * Math.pow(1 + nominal, years);
  const realFinal = nominalFinal / Math.pow(1 + inflation, years);

  return {
    realRatePct: realRate * 100,
    approxRealRatePct: nominalRatePct - inflationRatePct,
    nominalFinal,
    realFinal,
    purchasingPowerLoss: nominalFinal - realFinal,
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
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;
