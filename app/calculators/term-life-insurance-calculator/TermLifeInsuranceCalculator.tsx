"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeTermLife,
  formatUSD,
  type TermLifeResult,
} from "@/lib/calculators/term-life-insurance";

type FormState = {
  annualIncome: string;
  yearsToReplace: string;
  debts: string;
  mortgage: string;
  futureObligations: string;
  finalExpenses: string;
  existingAssets: string;
};

const DEFAULTS: FormState = {
  annualIncome: "60000",
  yearsToReplace: "10",
  debts: "15000",
  mortgage: "220000",
  futureObligations: "100000",
  finalExpenses: "15000",
  existingAssets: "50000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TermLifeResult | null {
  return computeTermLife({
    annualIncome: num(f.annualIncome),
    yearsToReplace: num(f.yearsToReplace),
    debts: num(f.debts) || 0,
    mortgage: num(f.mortgage) || 0,
    futureObligations: num(f.futureObligations) || 0,
    finalExpenses: num(f.finalExpenses) || 0,
    existingAssets: num(f.existingAssets) || 0,
  });
}

export default function TermLifeInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TermLifeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative income and number of years, and non-negative amounts for each other field.");
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
        { label: "Income replacement", value: result.incomeReplacement, color: "bg-orange-500" },
        { label: "Debts & obligations", value: result.obligations, color: "bg-orange-300" },
        { label: "Less existing cover", value: -result.lessExisting, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your household details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your income, debts and obligations, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Annual income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="years">Years of income to replace</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsToReplace} onChange={(e) => set("yearsToReplace", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="debts">Debts (excl. mortgage)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debts" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.debts} onChange={(e) => set("debts", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="mortgage">Remaining mortgage</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="mortgage" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.mortgage} onChange={(e) => set("mortgage", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="future">Future obligations (e.g. education)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="future" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.futureObligations} onChange={(e) => set("futureObligations", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="final">Final expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="final" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.finalExpenses} onChange={(e) => set("finalExpenses", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="existing">Existing savings & life cover</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="existing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingAssets} onChange={(e) => set("existingAssets", e.target.value)} />
                </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Recommended coverage</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.recommendedCoverage) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              DIME estimate of the term life cover your household may need
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
