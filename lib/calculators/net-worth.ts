// Pure logic for the Net Worth Calculator.
// Net worth is what you own minus what you owe. This sums a handful of common
// asset categories and liability categories, returns the breakdown for each
// side, and exposes a donut-friendly composition for charting.

export interface NetWorthInput {
  // Assets
  cash: number; // cash and bank balances
  investments: number; // brokerage, retirement, crypto, etc.
  realEstate: number; // home and property market value
  vehicles: number; // cars, boats, market value
  otherAssets: number; // valuables, business equity, etc.
  // Liabilities
  mortgage: number;
  loans: number; // auto, student, personal loans
  creditCards: number;
  otherDebts: number;
}

export interface NetWorthSlice {
  label: string;
  value: number;
  color: string;
}

export interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number; // cash + investments
  debtToAssetPct: number; // liabilities / assets, percent
  assetSlices: NetWorthSlice[];
  liabilitySlices: NetWorthSlice[];
}

const ASSET_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#fde68a"];
const LIABILITY_COLORS = ["#52525b", "#71717a", "#a1a1aa", "#d4d4d8"];

export function computeNetWorth(input: NetWorthInput): NetWorthResult | null {
  const values = Object.values(input);
  if (!values.every(Number.isFinite)) return null;
  if (values.some((v) => v < 0)) return null;

  const { cash, investments, realEstate, vehicles, otherAssets, mortgage, loans, creditCards, otherDebts } = input;

  const assetParts = [
    { label: "Cash", value: cash },
    { label: "Investments", value: investments },
    { label: "Real estate", value: realEstate },
    { label: "Vehicles", value: vehicles },
    { label: "Other assets", value: otherAssets },
  ];
  const liabilityParts = [
    { label: "Mortgage", value: mortgage },
    { label: "Loans", value: loans },
    { label: "Credit cards", value: creditCards },
    { label: "Other debts", value: otherDebts },
  ];

  const totalAssets = assetParts.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilityParts.reduce((s, a) => s + a.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const liquidAssets = cash + investments;
  const debtToAssetPct = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  const assetSlices: NetWorthSlice[] = assetParts.map((p, i) => ({
    ...p,
    color: ASSET_COLORS[i % ASSET_COLORS.length],
  }));
  const liabilitySlices: NetWorthSlice[] = liabilityParts.map((p, i) => ({
    ...p,
    color: LIABILITY_COLORS[i % LIABILITY_COLORS.length],
  }));

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidAssets,
    debtToAssetPct,
    assetSlices,
    liabilitySlices,
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
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(abs)}`;
}
