// Pure logic for the Envelope Budget Calculator.
// The envelope method splits monthly take-home pay into named spending
// "envelopes". This module allocates income across envelopes, reports what is
// left unallocated (or overspent), and exposes a per-envelope breakdown for a
// donut chart.

export interface Envelope {
  name: string;
  amount: number;
}

export interface EnvelopeBudgetInput {
  monthlyIncome: number;
  envelopes: Envelope[];
}

export interface EnvelopeSlice {
  name: string;
  amount: number;
  share: number; // fraction of income, 0..1
}

export interface EnvelopeBudgetResult {
  income: number;
  allocated: number;
  remaining: number; // income minus allocated (negative if overspent)
  overspent: boolean;
  allocatedPct: number; // 0..100
  slices: EnvelopeSlice[];
}

export function computeEnvelopeBudget(
  input: EnvelopeBudgetInput
): EnvelopeBudgetResult | null {
  const { monthlyIncome, envelopes } = input;

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return null;
  if (!Array.isArray(envelopes) || envelopes.length === 0) return null;

  let allocated = 0;
  const slices: EnvelopeSlice[] = [];

  for (const e of envelopes) {
    const amount = Number.isFinite(e.amount) ? Math.max(0, e.amount) : 0;
    if (amount <= 0) continue;
    allocated += amount;
    slices.push({
      name: e.name.trim() || "Envelope",
      amount,
      share: amount / monthlyIncome,
    });
  }

  if (slices.length === 0) return null;

  const remaining = monthlyIncome - allocated;

  return {
    income: monthlyIncome,
    allocated,
    remaining,
    overspent: remaining < 0,
    allocatedPct: (allocated / monthlyIncome) * 100,
    slices,
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
