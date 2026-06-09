"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCostOfLiving,
  formatUSD,
  type CostOfLivingResult,
} from "@/lib/calculators/cost-of-living";

type FormState = {
  currentSalary: string;
  currentIndex: string;
  destIndex: string;
};

const DEFAULTS: FormState = {
  currentSalary: "75000",
  currentIndex: "100",
  destIndex: "130",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CostOfLivingResult | null {
  return computeCostOfLiving({
    currentSalary: num(f.currentSalary) || 0,
    currentIndex: num(f.currentIndex),
    destIndex: num(f.destIndex),
  });
}

export default function CostOfLivingCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CostOfLivingResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a salary and cost of living index values greater than 0.");
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

  const currentSalaryNum = num(form.currentSalary) || 0;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Compare two cities</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Enter your salary and each city cost of living index, then press Calculate.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="salary">Current salary (per year)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSalary} onChange={(e) => set("currentSalary", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="current">Current city index</Label>
                <Input id="current" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentIndex} onChange={(e) => set("currentIndex", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dest">New city index</Label>
                <Input id="dest" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.destIndex} onChange={(e) => set("destIndex", e.target.value)} />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">
              A cost of living index uses 100 as the national average. A city at 130 is about 30%
              more expensive than average, while a city at 85 is about 15% cheaper.
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Equivalent salary needed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.equivalentSalary) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Current salary</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(currentSalaryNum)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">
                    {result.cheaper ? "You could save" : "Extra you need"}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(Math.abs(result.difference))}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Cost of living change</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {result.percentDifference >= 0 ? "+" : ""}
                    {result.percentDifference.toFixed(1)}%
                  </span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.cheaper
                ? "The new city is cheaper, so the same money goes further there."
                : "The new city is pricier, so you need a higher salary to keep the same lifestyle."}
            </p>
          )}
        </div>
      </form>

      {result && (
        <CompareChart current={currentSalaryNum} equivalent={result.equivalentSalary} />
      )}
    </div>
  );
}

function CompareChart({ current, equivalent }: { current: number; equivalent: number }) {
  const maxVal = Math.max(current, equivalent, 1);
  const bars = [
    { label: "Current city", value: current, color: "bg-zinc-300" },
    { label: "New city", value: equivalent, color: "bg-orange-500" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Salary needed to match your lifestyle</h3>
      <div className="space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-600">{b.label}</span>
              <span className="font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className={`h-full rounded-full ${b.color}`} style={{ width: `${(b.value / maxVal) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
