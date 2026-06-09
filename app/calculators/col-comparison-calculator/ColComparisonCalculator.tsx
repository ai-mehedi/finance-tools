"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeColComparison,
  COL_CATEGORIES,
  formatUSD,
  type ColComparisonResult,
} from "@/lib/calculators/col-comparison";

type FormState = {
  currentSalary: string;
  currentIndex: string;
  destinationIndex: string;
};

const DEFAULTS: FormState = {
  currentSalary: "80000",
  currentIndex: "100",
  destinationIndex: "135",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ColComparisonResult | null {
  return computeColComparison({
    currentSalary: num(f.currentSalary),
    currentIndex: num(f.currentIndex),
    destinationIndex: num(f.destinationIndex),
  });
}

export default function ColComparisonCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ColComparisonResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a salary and two cost of living index values greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Compare two cities</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Index 100 is the national average. Higher means pricier.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="salary">Current salary</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSalary} onChange={(e) => set("currentSalary", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curIdx">Current city index</Label>
                <Input id="curIdx" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentIndex} onChange={(e) => set("currentIndex", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="destIdx">Destination city index</Label>
                <Input id="destIdx" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.destinationIndex} onChange={(e) => set("destinationIndex", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Equivalent salary needed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.equivalentSalary) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Cost of living change</span>
                  <span className={`text-sm font-bold tabular-nums ${result.isCheaper ? "text-emerald-600" : "text-rose-500"}`}>
                    {result.percentChange >= 0 ? "+" : ""}{result.percentChange.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{result.isCheaper ? "You could earn less by" : "You would need extra"}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(Math.abs(result.difference))}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              The destination city is about{" "}
              <span className="font-semibold text-zinc-600">{(result.ratio * 100).toFixed(0)}%</span> as expensive as where you live now.
            </p>
          )}
        </div>
      </form>

      {result && <CategoryBreakdown result={result} />}
    </div>
  );
}

function CategoryBreakdown({ result }: { result: ColComparisonResult }) {
  const rows = COL_CATEGORIES.map((c) => {
    const destSpend = result.equivalentSalary * c.weight;
    const currentSpend = (result.equivalentSalary / result.ratio) * c.weight;
    return { label: c.label, currentSpend, destSpend };
  });
  const max = Math.max(...rows.map((r) => Math.max(r.currentSpend, r.destSpend))) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Estimated spending by category</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /> Current city</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Destination</span>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-600">{r.label}</span>
              <span className="font-semibold tabular-nums text-zinc-900">{formatUSD(r.destSpend)} / yr</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-zinc-300" style={{ width: `${(r.currentSpend / max) * 100}%` }} />
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${(r.destSpend / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Category splits use typical US household budget weights and are estimates, not exact local prices.
      </p>
    </div>
  );
}
