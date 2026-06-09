"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLoanEligibility,
  formatUSD,
  formatUSD2,
  type LoanEligibilityResult,
} from "@/lib/calculators/loan-eligibility";

type FormState = {
  monthlyIncome: string;
  existingDebt: string;
  maxDtiPct: string;
  annualRatePct: string;
  termYears: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "6000",
  existingDebt: "500",
  maxDtiPct: "43",
  annualRatePct: "7.5",
  termYears: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LoanEligibilityResult | null {
  return computeLoanEligibility({
    monthlyIncome: num(f.monthlyIncome) || 0,
    existingDebt: num(f.existingDebt) || 0,
    maxDtiPct: num(f.maxDtiPct) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function LoanEligibilityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LoanEligibilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a monthly income and loan term greater than 0.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Your finances</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Money id="income" label="Gross monthly income" value={form.monthlyIncome} onChange={(v) => set("monthlyIncome", v)} />
            <Money id="debt" label="Existing monthly debt" value={form.existingDebt} onChange={(v) => set("existingDebt", v)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="dti">Max DTI (%)</Label>
              <Input id="dti" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.maxDtiPct} onChange={(e) => set("maxDtiPct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rate">Rate (% / yr)</Label>
              <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="term">Term (years)</Label>
              <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Eligible loan amount</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.eligibleAmount) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Affordable payment / mo</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.affordablePayment)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total interest</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total repayable</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPayable)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            This is an estimate based on your debt-to-income ratio. Lenders also weigh credit score, employment and assets.
          </p>
        )}
      </div>
    </form>
  );
}
