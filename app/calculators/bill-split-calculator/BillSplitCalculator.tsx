"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBillSplit,
  formatUSD,
  type BillSplitResult,
} from "@/lib/calculators/bill-split";

type FormState = { billAmount: string; tipPct: string; people: string };

const DEFAULTS: FormState = { billAmount: "120", tipPct: "18", people: "4" };

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BillSplitResult | null {
  return computeBillSplit({
    billAmount: num(f.billAmount) || 0,
    tipPct: num(f.tipPct) || 0,
    people: num(f.people) || 0,
  });
}

const TIP_PRESETS = [10, 15, 18, 20, 25];

export default function BillSplitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BillSplitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a bill amount and at least 1 person.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Bill details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="bill">Bill amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="bill" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.billAmount} onChange={(e) => set("billAmount", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tip">Tip (%)</Label>
              <Input id="tip" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.tipPct} onChange={(e) => set("tipPct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="people">Number of people</Label>
              <Input id="people" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.people} onChange={(e) => set("people", e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {TIP_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("tipPct", String(t))}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  num(form.tipPct) === t
                    ? "border-orange-300 bg-orange-50 text-orange-600"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {t}%
              </button>
            ))}
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Each person pays</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.perPerson) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Tip amount</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.tipAmount)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total with tip</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Split between</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.people} people</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Per-person amounts are rounded up to the nearest cent so the group always covers the full bill.
          </p>
        )}
      </div>
    </form>
  );
}
