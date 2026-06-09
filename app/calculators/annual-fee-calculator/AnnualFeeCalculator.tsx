"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeAnnualFee,
  formatUSD,
  type AnnualFeeResult,
} from "@/lib/calculators/annual-fee";

type FormState = {
  annualFee: string;
  monthlySpend: string;
  rewardRatePct: string;
  perksValue: string;
  signupBonus: string;
};

const DEFAULTS: FormState = {
  annualFee: "95",
  monthlySpend: "1500",
  rewardRatePct: "2",
  perksValue: "120",
  signupBonus: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AnnualFeeResult | null {
  return computeAnnualFee({
    annualFee: num(f.annualFee) || 0,
    monthlySpend: num(f.monthlySpend) || 0,
    rewardRatePct: num(f.rewardRatePct) || 0,
    perksValue: num(f.perksValue) || 0,
    signupBonus: num(f.signupBonus) || 0,
  });
}

export default function AnnualFeeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<AnnualFeeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative numbers for all fields.");
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

  // Width of the value bar relative to the fee bar, so the comparison is visual.
  const fee = num(form.annualFee) || 0;
  const gross = result ? result.grossValueOngoing : 0;
  const scale = Math.max(fee, gross) || 1;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Card details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fee">Annual fee</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="fee" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualFee} onChange={(e) => set("annualFee", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="spend">Monthly spend</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="spend" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlySpend} onChange={(e) => set("monthlySpend", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Rewards rate (%)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.rewardRatePct} onChange={(e) => set("rewardRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="perks">Perks value / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="perks" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.perksValue} onChange={(e) => set("perksValue", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bonus">Sign-up bonus (first year)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="bonus" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.signupBonus} onChange={(e) => set("signupBonus", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net value per year</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netValueOngoing) : "—"}
          </p>
          {result && (
            <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${result.worthIt ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {result.worthIt ? "Worth the fee" : "Fee not covered"}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Rewards earned</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.rewardsEarned)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Perks value</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.perksValue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">First-year net value</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netValueFirstYear)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && result.breakEvenSpend !== null && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              You would need to spend{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.breakEvenSpend)}</span>{" "}
              a year on rewards alone to cover the fee after perks.
            </p>
          )}
        </div>
      </form>

      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-zinc-900">Value earned vs annual fee</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-zinc-500">
                <span>Value earned (rewards + perks)</span>
                <span className="tabular-nums text-zinc-700">{formatUSD(result.grossValueOngoing)}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, (result.grossValueOngoing / scale) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-zinc-500">
                <span>Annual fee</span>
                <span className="tabular-nums text-zinc-700">{formatUSD(fee)}</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-400" style={{ width: `${Math.min(100, (fee / scale) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
