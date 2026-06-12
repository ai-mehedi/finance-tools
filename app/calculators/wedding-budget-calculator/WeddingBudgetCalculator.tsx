"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeWeddingBudget,
  formatUSD,
  formatCompact,
  type WeddingBudgetResult,
} from "@/lib/calculators/wedding-budget";

type FormState = {
  totalBudget: string;
  guests: string;
};

const DEFAULTS: FormState = {
  totalBudget: "30000",
  guests: "120",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): WeddingBudgetResult | null {
  return computeWeddingBudget({
    totalBudget: num(f.totalBudget),
    guests: num(f.guests),
  });
}

// A fixed orange-themed palette so colors are deterministic across renders.
const SLICE_COLORS = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#ea580c",
  "#fcd34d",
  "#f59e0b",
  "#fbbf24",
  "#d97706",
];

export default function WeddingBudgetCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<WeddingBudgetResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a total budget and a guest count that are both greater than 0.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setForm(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your wedding plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter a budget and guest count, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget">Total budget</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="budget" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.totalBudget} onChange={(e) => set("totalBudget", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="guests">Guests</Label>
                <Input id="guests" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.guests} onChange={(e) => set("guests", e.target.value)} />
              </div>
            </div>

            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" size="lg" className="flex-1">
                <Calculator /> Calculate
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={reset}>
                <RotateCcw /> Reset
              </Button>
            </div>

            {/* Category breakdown */}
            {result && (
              <div className="mt-2 space-y-1.5">
                {result.categories.map((c, i) => (
                  <div key={c.key} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                      {c.label}
                      <span className="text-xs text-zinc-400">{c.sharePct}%</span>
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(c.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Cost per guest</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.perGuest) : "—"}
          </p>
          {result ? (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total budget</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalBudget)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Guests</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.guests}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Biggest line (venue & catering)</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">
                  {formatUSD(result.categories[0]?.amount ?? 0)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </form>

      {/* Donut chart */}
      {result && <BudgetDonut result={result} />}
    </div>
  );
}

function BudgetDonut({ result }: { result: WeddingBudgetResult }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const stroke = 34;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const total = result.totalBudget || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the budget goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48 shrink-0" role="img" aria-label="Wedding budget breakdown by category">
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
            {result.categories.map((c, i) => {
              const frac = c.amount / total;
              const dash = frac * circ;
              const seg = (
                <circle
                  key={c.key}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={SLICE_COLORS[i % SLICE_COLORS.length]}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return seg;
            })}
          </g>
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={18} fontWeight={800}>
            {formatCompact(result.totalBudget)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={11}>total budget</text>
        </svg>

        <div className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
          {result.categories.map((c, i) => (
            <div key={c.key} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                {c.label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">{formatCompact(c.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
