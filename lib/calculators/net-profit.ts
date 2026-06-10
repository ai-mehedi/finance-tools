// Pure logic for the Net Profit Calculator.
// Works down a simple income statement: revenue minus cost of goods sold gives
// gross profit; minus operating expenses gives operating profit; minus interest
// and taxes gives net profit. Reports margins at each stage and a per-stage
// waterfall schedule for charting.

export interface NetProfitInput {
  revenue: number;
  cogs: number; // cost of goods sold
  operatingExpenses: number; // SG&A, salaries, rent, marketing, etc.
  interest: number; // interest expense
  taxRatePct: number; // applied to pre-tax profit when positive
}

export interface NetProfitStage {
  label: string;
  amount: number; // the value remaining at this stage
  delta: number; // the cost subtracted to reach this stage (0 for revenue)
}

export interface NetProfitResult {
  grossProfit: number;
  operatingProfit: number; // EBIT
  preTaxProfit: number; // EBT
  taxAmount: number;
  netProfit: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  netMarginPct: number;
  stages: NetProfitStage[];
}

export function computeNetProfit(input: NetProfitInput): NetProfitResult | null {
  const { revenue, cogs, operatingExpenses, interest, taxRatePct } = input;

  if (![revenue, cogs, operatingExpenses, interest, taxRatePct].every(Number.isFinite)) return null;
  if (revenue < 0 || cogs < 0 || operatingExpenses < 0 || interest < 0) return null;
  if (taxRatePct < 0 || taxRatePct > 100) return null;

  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - operatingExpenses;
  const preTaxProfit = operatingProfit - interest;
  // Tax only applies to a positive pre-tax profit; losses incur no tax here.
  const taxAmount = preTaxProfit > 0 ? preTaxProfit * (taxRatePct / 100) : 0;
  const netProfit = preTaxProfit - taxAmount;

  const pct = (part: number) => (revenue > 0 ? (part / revenue) * 100 : 0);

  const stages: NetProfitStage[] = [
    { label: "Revenue", amount: revenue, delta: 0 },
    { label: "Gross profit", amount: grossProfit, delta: cogs },
    { label: "Operating profit", amount: operatingProfit, delta: operatingExpenses },
    { label: "Pre-tax profit", amount: preTaxProfit, delta: interest },
    { label: "Net profit", amount: netProfit, delta: taxAmount },
  ];

  return {
    grossProfit,
    operatingProfit,
    preTaxProfit,
    taxAmount,
    netProfit,
    grossMarginPct: pct(grossProfit),
    operatingMarginPct: pct(operatingProfit),
    netMarginPct: pct(netProfit),
    stages,
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
