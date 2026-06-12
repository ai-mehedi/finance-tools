"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeProfitMarginTax,
  formatUSD,
  formatPct,
  type ProfitMarginTaxResult,
} from "@/lib/calculators/profit-margin-tax";

type FormState = {
  revenue: string;
  cost: string;
  taxRatePct: string;
};

const DEFAULTS: FormState = {
  revenue: "10000",
  cost: "6500",
  taxRatePct: "21",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ProfitMarginTaxResult | null {
  return computeProfitMarginTax({
    revenue: num(f.revenue),
    cost: num(f.cost) || 0,
    taxRatePct: num(f.taxRatePct) || 0,
  });
}

export default function ProfitMarginTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ProfitMarginTaxResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a revenue greater than 0, a non-negative cost, and a non-negative tax rate.");
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

  const breakdown = result
    ? [
        { label: "Pre-tax profit", value: formatUSD(result.pretaxProfit) },
        { label: "Tax owed", value: formatUSD(result.taxAmount) },
        { label: "After-tax profit", value: formatUSD(result.aftertaxProfit) },
        { label: "Pre-tax margin", value: formatPct(result.pretaxMarginPct) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter sales, cost and tax rate, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revenue">Revenue (sales)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cost">Total cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="taxrate">Tax rate (% on profit)</Label>
              <Input id="taxrate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">After-tax margin</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.aftertaxMarginPct) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Stacked bar */}
      {result && result.pretaxProfit >= 0 && <SplitBar result={result} />}
    </div>
  );
}

function SplitBar({ result }: { result: ProfitMarginTaxResult }) {
  const total = result.slices.reduce((s, x) => s + x.value, 0) || 1;
  const colors: Record<string, string> = {
    "bg-zinc-300": "#d4d4d8",
    "bg-orange-300": "#fdba74",
    "bg-orange-500": "#f97316",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">How revenue splits</h3>
      <div className="flex h-8 w-full overflow-hidden rounded-lg">
        {result.slices.map((s) => {
          const pct = (s.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={s.label}
              style={{ width: `${pct}%`, backgroundColor: colors[s.color] || "#fb923c" }}
              title={`${s.label}: ${formatUSD(s.value)}`}
            />
          );
        })}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {result.slices.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-600">
              <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
              {s.label}
            </span>
            <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
