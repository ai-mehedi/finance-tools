"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeEffectiveTaxRate,
  formatUSD,
  formatPct,
  type EffectiveTaxRateResult,
} from "@/lib/calculators/effective-tax-rate";

type FormState = { income: string; taxPaid: string };

const DEFAULTS: FormState = { income: "85000", taxPaid: "14500" };

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): EffectiveTaxRateResult | null {
  return computeEffectiveTaxRate({
    income: num(f.income) || 0,
    taxPaid: num(f.taxPaid) || 0,
  });
}

export default function EffectiveTaxRateCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EffectiveTaxRateResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an income greater than 0 and a non-negative tax amount.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Enter your figures</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Use your total income and total tax, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Total income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.income} onChange={(e) => set("income", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="taxPaid">Total tax paid</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="taxPaid" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.taxPaid} onChange={(e) => set("taxPaid", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Effective tax rate</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.effectiveRate) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tax paid</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(num(form.taxPaid) || 0)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Take-home</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.takeHome)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              You keep <span className="font-semibold text-zinc-600">{formatPct(result.takeHomeRate)}</span> of your income after tax.
            </p>
          )}
        </div>
      </form>

      {result && <SplitBar result={result} />}
    </div>
  );
}

function SplitBar({ result }: { result: EffectiveTaxRateResult }) {
  const taxW = Math.max(0, Math.min(100, result.effectiveRate));
  const keepW = Math.max(0, Math.min(100, result.takeHomeRate));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your income goes</h3>
      <div className="flex h-6 w-full overflow-hidden rounded-full">
        <div className="bg-orange-500" style={{ width: `${taxW}%` }} title={`Tax ${result.effectiveRate.toFixed(1)}%`} />
        <div className="bg-emerald-400" style={{ width: `${keepW}%` }} title={`Take-home ${result.takeHomeRate.toFixed(1)}%`} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          Tax {result.effectiveRate.toFixed(1)}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Take-home {result.takeHomeRate.toFixed(1)}%
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Your effective rate spreads your total tax across all of your income, so it is usually lower than the marginal rate on your last dollar.
      </p>
    </div>
  );
}
