"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeNetProfitMargin,
  formatUSD,
  formatPct,
  type NetProfitMarginResult,
} from "@/lib/calculators/net-profit-margin";

type FormState = {
  revenue: string;
  expenses: string;
};

const DEFAULTS: FormState = {
  revenue: "250000",
  expenses: "210000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): NetProfitMarginResult | null {
  return computeNetProfitMargin({
    revenue: num(f.revenue),
    expenses: num(f.expenses) || 0,
  });
}

export default function NetProfitMarginCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<NetProfitMarginResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter total revenue above 0 and total expenses of 0 or more.");
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
        { label: "Revenue", value: result.revenue, color: "bg-zinc-300" },
        { label: "Total expenses", value: result.expenses, color: "bg-orange-300" },
        {
          label: "Net profit",
          value: result.netProfit,
          color: result.isLoss ? "bg-rose-500" : "bg-orange-500",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Business figures</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your total revenue and total expenses, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revenue">Total revenue</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="expenses">Total expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.expenses} onChange={(e) => set("expenses", e.target.value)} />
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Net profit is calculated for you as revenue minus expenses. If expenses exceed revenue, the result is shown as a loss.
            </p>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net profit margin</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.netMarginPct) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.isLoss
                ? `Net loss of ${formatUSD(Math.abs(result.netProfit))}`
                : `${formatUSD(result.netProfit)} kept from every ${formatUSD(result.revenue)} in revenue`}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
