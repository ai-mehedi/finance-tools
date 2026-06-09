"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeEmergencyFund,
  formatUSD,
  type EmergencyFundResult,
} from "@/lib/calculators/emergency-fund";

type FormState = {
  monthlyExpenses: string;
  monthsCoverage: string;
  currentSavings: string;
  monthlySaving: string;
};

const DEFAULTS: FormState = {
  monthlyExpenses: "3500",
  monthsCoverage: "6",
  currentSavings: "8000",
  monthlySaving: "500",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): EmergencyFundResult | null {
  return computeEmergencyFund({
    monthlyExpenses: num(f.monthlyExpenses) || 0,
    monthsCoverage: num(f.monthsCoverage) || 0,
    currentSavings: num(f.currentSavings) || 0,
    monthlySaving: num(f.monthlySaving) || 0,
  });
}

export default function EmergencyFundCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EmergencyFundResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter monthly expenses and months of coverage greater than 0.");
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
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expenses">Monthly expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyExpenses} onChange={(e) => set("monthlyExpenses", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="months">Months of coverage</Label>
                <Input id="months" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.monthsCoverage} onChange={(e) => set("monthsCoverage", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="current">Current savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="current" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="saving">Saving per month</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="saving" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlySaving} onChange={(e) => set("monthlySaving", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Target fund</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.targetFund) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Current savings</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(num(form.currentSavings) || 0)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{result.funded ? "Surplus" : "Still needed"}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.funded ? (num(form.currentSavings) || 0) - result.targetFund : result.gap)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.funded ? (
                <>You are fully funded. Your savings already cover about {result.currentMonthsCovered.toFixed(1)} months of expenses.</>
              ) : result.monthsToGoal !== null ? (
                <>At your current pace you will reach the goal in about <span className="font-semibold text-zinc-600">{result.monthsToGoal}</span> months.</>
              ) : (
                <>Add a monthly saving amount to see how long it takes to reach the goal.</>
              )}
            </p>
          )}
        </div>
      </form>

      {result && <ProgressBar result={result} current={num(form.currentSavings) || 0} />}
    </div>
  );
}

function ProgressBar({ result, current }: { result: EmergencyFundResult; current: number }) {
  const pct = result.targetFund > 0 ? Math.min(100, (current / result.targetFund) * 100) : 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Progress toward your fund</h3>
        <span className="text-sm font-bold tabular-nums text-orange-600">{pct.toFixed(0)}%</span>
      </div>
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className="bg-orange-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          Saved {formatUSD(Math.min(current, result.targetFund))}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          Remaining {formatUSD(result.gap)}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Keep your emergency fund in a separate, easy to access account so it is ready when you need it.
      </p>
    </div>
  );
}
