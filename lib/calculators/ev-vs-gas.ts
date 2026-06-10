// Pure logic for the EV vs Gas Savings Calculator.
// Compares the running fuel/energy cost of an electric vehicle against a
// gasoline vehicle over a chosen ownership horizon, given annual mileage,
// efficiency and energy prices. Returns the per-year cumulative cost for each
// vehicle, the crossover year (when EV total cost dips below gas) and the
// optional impact of a higher EV purchase price.

export interface EvVsGasInput {
  annualMiles: number;
  years: number;
  gasMpg: number; // miles per gallon
  gasPricePerGallon: number;
  evMilesPerKwh: number; // efficiency, e.g. 3.5 mi/kWh
  electricityPricePerKwh: number;
  priceDifference: number; // EV price minus gas price (extra upfront cost of EV)
  annualMaintenanceGas: number;
  annualMaintenanceEv: number;
}

export interface EvVsGasYearPoint {
  year: number;
  gasCumulative: number;
  evCumulative: number; // includes upfront price difference
}

export interface EvVsGasResult {
  gasFuelPerYear: number;
  evEnergyPerYear: number;
  gasTotalCost: number; // fuel + maintenance over horizon
  evTotalCost: number; // energy + maintenance + price difference over horizon
  fuelSavingsPerYear: number;
  totalSavings: number; // gas total minus EV total
  breakEvenYear: number | null; // year when EV cumulative first drops below gas
  schedule: EvVsGasYearPoint[];
}

export function computeEvVsGas(input: EvVsGasInput): EvVsGasResult | null {
  const {
    annualMiles,
    years,
    gasMpg,
    gasPricePerGallon,
    evMilesPerKwh,
    electricityPricePerKwh,
    priceDifference,
    annualMaintenanceGas,
    annualMaintenanceEv,
  } = input;

  if (!Number.isFinite(annualMiles) || annualMiles < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(gasMpg) || gasMpg <= 0) return null;
  if (!Number.isFinite(evMilesPerKwh) || evMilesPerKwh <= 0) return null;
  if (gasPricePerGallon < 0 || electricityPricePerKwh < 0) return null;

  const gasFuelPerYear = (annualMiles / gasMpg) * gasPricePerGallon;
  const evEnergyPerYear = (annualMiles / evMilesPerKwh) * electricityPricePerKwh;

  const gasYearly = gasFuelPerYear + (annualMaintenanceGas || 0);
  const evYearly = evEnergyPerYear + (annualMaintenanceEv || 0);

  const wholeYears = Math.round(years);
  const schedule: EvVsGasYearPoint[] = [
    { year: 0, gasCumulative: 0, evCumulative: priceDifference || 0 },
  ];

  let gasCum = 0;
  let evCum = priceDifference || 0;
  let breakEvenYear: number | null = evCum <= 0 ? 0 : null;

  for (let yr = 1; yr <= wholeYears; yr++) {
    gasCum += gasYearly;
    evCum += evYearly;
    if (breakEvenYear === null && evCum <= gasCum) breakEvenYear = yr;
    schedule.push({ year: yr, gasCumulative: gasCum, evCumulative: evCum });
  }

  return {
    gasFuelPerYear,
    evEnergyPerYear,
    gasTotalCost: gasCum,
    evTotalCost: evCum,
    fuelSavingsPerYear: gasFuelPerYear - evEnergyPerYear,
    totalSavings: gasCum - evCum,
    breakEvenYear,
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
