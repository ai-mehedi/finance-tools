// Pure logic for the Pip Calculator.
// Computes the monetary value of a single pip for a forex position, given the
// trade size (in units), the pip size for the pair, and the exchange rate used
// to convert the pip value into the account currency. Also returns the value of
// a range of common position sizes for charting and quick reference.

export type LotType = "standard" | "mini" | "micro" | "nano" | "custom";

// Units per lot for each preset.
export const LOT_UNITS: Record<Exclude<LotType, "custom">, number> = {
  standard: 100000,
  mini: 10000,
  micro: 1000,
  nano: 100,
};

export interface PipInput {
  // Number of currency units in the position (e.g. 100000 for one standard lot).
  units: number;
  // Pip size in price terms. 0.0001 for most pairs, 0.01 for JPY pairs.
  pipSize: number;
  // Rate that converts one unit of the quote currency into the account currency.
  // If the quote currency equals the account currency this is 1.
  quoteToAccountRate: number;
}

export interface PipSizePoint {
  label: string;
  units: number;
  pipValue: number;
}

export interface PipResult {
  // Value of one pip in the account currency.
  pipValuePerUnit: number; // value of one pip per single unit
  pipValue: number; // value of one pip for the whole position
  pipValue10: number; // value of a 10 pip move
  pipValue50: number; // value of a 50 pip move
  schedule: PipSizePoint[];
}

// Pip value (account currency) = pipSize * units * quoteToAccountRate.
export function computePip(input: PipInput): PipResult | null {
  const { units, pipSize, quoteToAccountRate } = input;

  if (!Number.isFinite(units) || units <= 0) return null;
  if (!Number.isFinite(pipSize) || pipSize <= 0) return null;
  if (!Number.isFinite(quoteToAccountRate) || quoteToAccountRate <= 0) return null;

  const pipValuePerUnit = pipSize * quoteToAccountRate;
  const pipValue = pipValuePerUnit * units;

  const presets: { label: string; units: number }[] = [
    { label: "Micro", units: LOT_UNITS.micro },
    { label: "Mini", units: LOT_UNITS.mini },
    { label: "Standard", units: LOT_UNITS.standard },
    { label: "5 lots", units: LOT_UNITS.standard * 5 },
  ];

  const schedule: PipSizePoint[] = presets.map((p) => ({
    label: p.label,
    units: p.units,
    pipValue: pipValuePerUnit * p.units,
  }));

  return {
    pipValuePerUnit,
    pipValue,
    pipValue10: pipValue * 10,
    pipValue50: pipValue * 50,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  if (abs > 0 && abs < 1) return `$${n.toFixed(2)}`;
  return `$${Math.round(n)}`;
}
