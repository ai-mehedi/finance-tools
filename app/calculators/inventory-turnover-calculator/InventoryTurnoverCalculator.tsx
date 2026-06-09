"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeInventoryTurnover,
  formatUSD,
  formatNumber,
  type InventoryTurnoverResult,
} from "@/lib/calculators/inventory-turnover";

type FormState = {
  cogs: string;
  averageInventory: string;
  daysInPeriod: string;
};

const DEFAULTS: FormState = {
  cogs: "500000",
  averageInventory: "80000",
  daysInPeriod: "365",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): InventoryTurnoverResult | null {
  return computeInventoryTurnover({
    cogs: num(f.cogs) || 0,
    averageInventory: num(f.averageInventory),
    daysInPeriod: num(f.daysInPeriod),
  });
}

export default function InventoryTurnoverCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<InventoryTurnoverResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a cost of goods sold, plus an average inventory and period above 0.");
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
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Enter the figures</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="cogs">Cost of goods sold</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="cogs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cogs} onChange={(e) => set("cogs", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="avg">Average inventory</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="avg" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.averageInventory} onChange={(e) => set("averageInventory", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="days">Days in period</Label>
              <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.daysInPeriod} onChange={(e) => set("daysInPeriod", e.target.value)} />
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
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Turnover ratio</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? `${formatNumber(result.turnoverRatio)}x` : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Days inventory on hand</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.daysOnHand)} days</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Cost of goods sold</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(num(form.cogs) || 0)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </div>
    </form>
  );
}
