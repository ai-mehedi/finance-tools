"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeEstateTax,
  formatUSD,
  formatCompact,
  type EstateTaxResult,
} from "@/lib/calculators/estate-tax";

type FormState = {
  grossEstate: string;
  debtsAndExpenses: string;
  charitableBequests: string;
  maritalDeduction: string;
  exclusion: string;
  ratePct: string;
};

const DEFAULTS: FormState = {
  grossEstate: "20000000",
  debtsAndExpenses: "500000",
  charitableBequests: "1000000",
  maritalDeduction: "0",
  exclusion: "13990000",
  ratePct: "40",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): EstateTaxResult | null {
  return computeEstateTax({
    grossEstate: num(f.grossEstate) || 0,
    debtsAndExpenses: num(f.debtsAndExpenses) || 0,
    charitableBequests: num(f.charitableBequests) || 0,
    maritalDeduction: num(f.maritalDeduction) || 0,
    exclusion: num(f.exclusion) || 0,
    ratePct: num(f.ratePct),
  });
}

export default function EstateTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EstateTaxResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a gross estate above 0 and a valid tax rate.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Estate details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the estate value and deductions, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="gross">Gross estate value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="gross" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.grossEstate} onChange={(e) => set("grossEstate", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="debts">Debts & expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debts" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.debtsAndExpenses} onChange={(e) => set("debtsAndExpenses", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="charity">Charitable bequests</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="charity" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.charitableBequests} onChange={(e) => set("charitableBequests", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="marital">Marital deduction</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="marital" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.maritalDeduction} onChange={(e) => set("maritalDeduction", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="excl">Lifetime exclusion</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="excl" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.exclusion} onChange={(e) => set("exclusion", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="w-1/2 pr-1.5">
              <Label htmlFor="rate">Top tax rate (%)</Label>
              <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.ratePct} onChange={(e) => set("ratePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated estate tax</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.estateTax) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Taxable estate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.taxableEstate)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Above exclusion</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.amountAboveExclusion)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Net to heirs</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netToHeirs)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Effective rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.effectiveRatePct.toFixed(1)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <EstateBars result={result} />}
    </div>
  );
}

function EstateBars({ result }: { result: EstateTaxResult }) {
  const total = Math.max(result.grossEstate, 1);
  const segments = result.bands.filter((b) => b.value > 0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Estate composition</h3>
        <span className="text-xs text-zinc-500">Gross {formatCompact(result.grossEstate)}</span>
      </div>

      <div className="flex h-7 w-full overflow-hidden rounded-lg bg-zinc-100">
        {segments.map((s) => {
          const pct = (s.value / total) * 100;
          return (
            <div
              key={s.label}
              className={s.color}
              style={{ width: `${pct.toFixed(2)}%` }}
              title={`${s.label}: ${formatUSD(s.value)}`}
            />
          );
        })}
      </div>

      <ul className="mt-4 space-y-2">
        {result.bands.map((b) => (
          <li key={b.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-500">
              <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
              {b.label}
            </span>
            <span className="font-semibold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between border-t border-zinc-100 pt-2 text-sm">
          <span className="font-semibold text-zinc-700">Estate tax due</span>
          <span className="font-bold tabular-nums text-orange-600">{formatUSD(result.estateTax)}</span>
        </li>
      </ul>
    </div>
  );
}
