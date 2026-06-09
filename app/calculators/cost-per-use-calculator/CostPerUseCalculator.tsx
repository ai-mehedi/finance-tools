"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCostPerUse,
  formatUSD,
  type CostPerUseResult,
} from "@/lib/calculators/cost-per-use";

type FormState = {
  price: string;
  usesPerWeek: string;
  ownershipWeeks: string;
  runningCostPerWeek: string;
};

const DEFAULTS: FormState = {
  price: "120",
  usesPerWeek: "3",
  ownershipWeeks: "104",
  runningCostPerWeek: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CostPerUseResult | null {
  return computeCostPerUse({
    price: num(f.price) || 0,
    usesPerWeek: num(f.usesPerWeek),
    ownershipWeeks: num(f.ownershipWeeks),
    runningCostPerWeek: num(f.runningCostPerWeek) || 0,
  });
}

export default function CostPerUseCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CostPerUseResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a price, uses per week and weeks owned greater than 0.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Item details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="price">Purchase price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="uses">Uses per week</Label>
              <Input id="uses" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.usesPerWeek} onChange={(e) => set("usesPerWeek", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weeks">Weeks you keep it</Label>
              <Input id="weeks" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.ownershipWeeks} onChange={(e) => set("ownershipWeeks", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="running">Running cost per week (optional)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="running" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.runningCostPerWeek} onChange={(e) => set("runningCostPerWeek", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Cost per use</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.costPerUse) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total uses</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{Math.round(result.totalUses).toLocaleString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total cost</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCost)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Cost per week</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.costPerWeek)}</span>
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
