"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { computeCPI, formatUSD, type CPIResult } from "@/lib/calculators/cpi";

type FormState = { amount: string; startCPI: string; endCPI: string };

const DEFAULTS: FormState = { amount: "1000", startCPI: "100", endCPI: "130" };

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CPIResult | null {
  return computeCPI({
    amount: num(f.amount) || 0,
    startCPI: num(f.startCPI),
    endCPI: num(f.endCPI),
  });
}

export default function CpiCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CPIResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an amount and CPI index values greater than 0.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Enter the details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="amount">Amount in start period</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startCPI">Start CPI index</Label>
              <Input id="startCPI" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.startCPI} onChange={(e) => set("startCPI", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endCPI">End CPI index</Label>
              <Input id="endCPI" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.endCPI} onChange={(e) => set("endCPI", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Adjusted amount</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.adjustedAmount) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total inflation</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.totalInflationPct.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Change in value</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.changeAmount)}</span>
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
