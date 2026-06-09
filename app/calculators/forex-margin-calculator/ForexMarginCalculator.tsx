"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeForexMargin,
  formatUSD,
  formatUSD0,
  type ForexMarginResult,
} from "@/lib/calculators/forex-margin";

type FormState = {
  lots: string;
  contractSize: string;
  price: string;
  leverage: string;
};

const DEFAULTS: FormState = {
  lots: "1",
  contractSize: "100000",
  price: "1.085",
  leverage: "100",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ForexMarginResult | null {
  return computeForexMargin({
    lots: num(f.lots),
    contractSize: num(f.contractSize),
    price: num(f.price),
    leverage: num(f.leverage),
  });
}

export default function ForexMarginCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ForexMarginResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter positive values for lots, contract size, price and leverage.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Position details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lots">Trade size (lots)</Label>
              <Input id="lots" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.lots} onChange={(e) => set("lots", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contract">Contract size (units / lot)</Label>
              <Input id="contract" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.contractSize} onChange={(e) => set("contractSize", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Current price</Label>
              <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="leverage">Leverage (X : 1)</Label>
              <Input id="leverage" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.leverage} onChange={(e) => set("leverage", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Required margin</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.requiredMargin) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Position units</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.positionUnits.toLocaleString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Notional value</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD0(result.notionalValue)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Margin requirement</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.marginPercent.toFixed(2)}%</span>
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
