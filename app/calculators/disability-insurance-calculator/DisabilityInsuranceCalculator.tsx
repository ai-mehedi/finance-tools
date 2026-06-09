"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeDisability,
  formatUSD,
  type DisabilityResult,
} from "@/lib/calculators/disability-insurance";

type FormState = {
  income: string;
  replacement: string;
  existing: string;
  expenses: string;
  years: string;
};

const DEFAULTS: FormState = {
  income: "5000",
  replacement: "60",
  existing: "1200",
  expenses: "3200",
  years: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DisabilityResult | null {
  return computeDisability({
    grossMonthlyIncome: num(f.income),
    replacementPct: num(f.replacement),
    existingMonthlyBenefit: num(f.existing) || 0,
    monthlyEssentialExpenses: num(f.expenses) || 0,
    benefitYears: num(f.years),
  });
}

const BAR_COLORS = ["bg-zinc-300", "bg-orange-500"];

export default function DisabilityInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DisabilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an income above 0, a replacement percent from 0 to 100, and a benefit period above 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your situation</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Use monthly amounts, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Gross monthly income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.income} onChange={(e) => set("income", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="replacement">Income to replace (%)</Label>
                <Input id="replacement" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.replacement} onChange={(e) => set("replacement", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="existing">Existing monthly benefit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="existing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existing} onChange={(e) => set("existing", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="expenses">Essential monthly expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.expenses} onChange={(e) => set("expenses", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="years">Benefit period (years)</Label>
              <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Coverage you should add</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${formatUSD(result.recommendedMonthlyBenefit)}/mo` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Target monthly benefit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.targetMonthlyBenefit)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Income coverage gap</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.coverageGap)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total over benefit period</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCoverageNeeded)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.components.length > 0 && <CoverageChart result={result} />}
    </div>
  );
}

function CoverageChart({ result }: { result: DisabilityResult }) {
  const total = result.targetMonthlyBenefit || 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Target monthly benefit, covered vs gap</h3>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-100">
        {result.components.map((c, i) => (
          <div
            key={c.label}
            className={BAR_COLORS[i % BAR_COLORS.length]}
            style={{ width: `${(c.value / total) * 100}%` }}
            title={`${c.label}: ${formatUSD(c.value)}`}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {result.components.map((c, i) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
            <span className="text-zinc-500">{c.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-zinc-700">{formatUSD(c.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
