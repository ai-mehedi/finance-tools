"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCreditScore,
  type CreditScoreResult,
} from "@/lib/calculators/credit-score";

type FormState = {
  onTimePaymentPct: string;
  utilizationPct: string;
  avgAccountAgeYears: string;
  accountTypes: string;
  hardInquiries: string;
};

const DEFAULTS: FormState = {
  onTimePaymentPct: "98",
  utilizationPct: "25",
  avgAccountAgeYears: "6",
  accountTypes: "3",
  hardInquiries: "1",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CreditScoreResult | null {
  return computeCreditScore({
    onTimePaymentPct: num(f.onTimePaymentPct) || 0,
    utilizationPct: num(f.utilizationPct) || 0,
    avgAccountAgeYears: num(f.avgAccountAgeYears) || 0,
    accountTypes: num(f.accountTypes) || 0,
    hardInquiries: num(f.hardInquiries) || 0,
  });
}

export default function CreditScoreCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CreditScoreResult | null>(() => compute(DEFAULTS));
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your credit profile</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Adjust the factors, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ontime">On-time payments (%)</Label>
                <Input id="ontime" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.onTimePaymentPct} onChange={(e) => set("onTimePaymentPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="util">Credit utilization (%)</Label>
                <Input id="util" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.utilizationPct} onChange={(e) => set("utilizationPct", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="age">Avg age (yrs)</Label>
                <Input id="age" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.avgAccountAgeYears} onChange={(e) => set("avgAccountAgeYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="types">Credit types</Label>
                <Input id="types" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.accountTypes} onChange={(e) => set("accountTypes", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="inq">Inquiries (12 mo)</Label>
                <Input id="inq" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hardInquiries} onChange={(e) => set("hardInquiries", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated score</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? result.score : "—"}
          </p>
          {result && <p className="mt-1 text-sm font-bold text-zinc-600">{result.band}</p>}
          <div className="mt-5 space-y-2">
            {result ? (
              result.factors.map((f) => (
                <div key={f.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{f.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">+{f.points}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Educational estimate on the 300 to 850 scale. Your real score depends on full bureau data.
          </p>
        </div>
      </form>

      {result && <FactorBars result={result} />}
    </div>
  );
}

function FactorBars({ result }: { result: CreditScoreResult }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">How each factor scores</h3>
        <span className="text-xs text-zinc-500">Bar = strength of each factor</span>
      </div>
      <div className="space-y-4">
        {result.factors.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-600">
              <span>{f.label} <span className="text-zinc-400">({f.weightPct}%)</span></span>
              <span className="tabular-nums">{Math.round(f.scorePct)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, Math.max(0, f.scorePct))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
