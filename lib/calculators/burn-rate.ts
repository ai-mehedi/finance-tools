// Pure logic for the Cash Burn Rate Calculator.
// Net burn = monthly expenses minus monthly revenue. Runway is how many months
// the current cash balance lasts at that burn rate. A per-month schedule lets
// us chart the cash balance falling to zero.

export interface BurnRateInput {
  cashOnHand: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
}

export interface BurnMonthPoint {
  month: number;
  cash: number;
}

export interface BurnRateResult {
  grossBurn: number; // monthly expenses
  netBurn: number; // expenses minus revenue (can be negative if profitable)
  runwayMonths: number; // Infinity if net burn is zero or negative
  runwayLabel: string; // human readable runway
  profitable: boolean;
  schedule: BurnMonthPoint[]; // cash balance per month while burning
}

export function computeBurnRate(input: BurnRateInput): BurnRateResult | null {
  const { cashOnHand, monthlyExpenses, monthlyRevenue } = input;

  if (!Number.isFinite(cashOnHand) || cashOnHand < 0) return null;
  if (monthlyExpenses < 0 || monthlyRevenue < 0) return null;
  if (!Number.isFinite(monthlyExpenses) || !Number.isFinite(monthlyRevenue)) return null;

  const grossBurn = monthlyExpenses;
  const netBurn = monthlyExpenses - monthlyRevenue;
  const profitable = netBurn <= 0;

  const runwayMonths = profitable ? Infinity : cashOnHand / netBurn;

  let runwayLabel: string;
  if (profitable) {
    runwayLabel = "Unlimited (cash flow positive)";
  } else {
    const whole = Math.floor(runwayMonths);
    const years = Math.floor(whole / 12);
    const months = whole % 12;
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} yr`);
    parts.push(`${months} mo`);
    runwayLabel = parts.join(" ");
  }

  // Build a depletion schedule for charting, capped at a sensible horizon.
  const schedule: BurnMonthPoint[] = [{ month: 0, cash: cashOnHand }];
  if (!profitable) {
    const maxMonths = Math.min(Math.ceil(runwayMonths), 120);
    let cash = cashOnHand;
    for (let m = 1; m <= maxMonths; m++) {
      cash = Math.max(0, cash - netBurn);
      schedule.push({ month: m, cash });
      if (cash <= 0) break;
    }
  }

  return { grossBurn, netBurn, runwayMonths, runwayLabel, profitable, schedule };
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
