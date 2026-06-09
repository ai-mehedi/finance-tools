"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeInsuranceNeeds,
  formatUSD,
  type InsuranceNeedsResult,
} from "@/lib/calculators/insurance-needs";

type FormState = {
  annualIncome: string;
  yearsToReplace: string;
  mortgageBalance: string;
  otherDebts: string;
  educationCosts: string;
  finalExpenses: string;
  existingSavings: string;
  existingCoverage: string;
};

const DEFAULTS: FormState = {
  annualIncome: "75000",
  yearsToReplace: "10",
  mortgageBalance: "250000",
  otherDebts: "20000",
  educationCosts: "100000",
  finalExpenses: "15000",
  existingSavings: "50000",
  existingCoverage: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): InsuranceNeedsResult | null {
  return computeInsuranceNeeds({
    annualIncome: num(f.annualIncome) || 0,
    yearsToReplace: num(f.yearsToReplace) || 0,
    mortgageBalance: num(f.mortgageBalance) || 0,
    otherDebts: num(f.otherDebts) || 0,
    educationCosts: num(f.educationCosts) || 0,
    finalExpenses: num(f.finalExpenses) || 0,
    existingSavings: num(f.existingSavings) || 0,
    existingCoverage: num(f.existingCoverage) || 0,
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

export default function InsuranceNeedsCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<InsuranceNeedsResult | null>(() => compute(DEFAULTS));
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

  const parts = result
    ? [
        { label: "Income replacement", value: result.incomeReplacement, color: "bg-orange-500" },
        { label: "Mortgage balance", value: result.mortgageBalance, color: "bg-orange-300" },
        { label: "Other debts", value: result.otherDebts, color: "bg-amber-300" },
        { label: "Education costs", value: result.educationCosts, color: "bg-amber-200" },
        { label: "Final expenses", value: result.finalExpenses, color: "bg-zinc-300" },
      ].filter((p) => p.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your situation</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="income" label="Annual income" value={form.annualIncome} onChange={(v) => set("annualIncome", v)} />
              <div>
                <Label htmlFor="years">Years to replace</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsToReplace} onChange={(e) => set("yearsToReplace", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="mortgage" label="Mortgage balance" value={form.mortgageBalance} onChange={(v) => set("mortgageBalance", v)} />
              <Money id="debts" label="Other debts" value={form.otherDebts} onChange={(v) => set("otherDebts", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="education" label="Education costs" value={form.educationCosts} onChange={(v) => set("educationCosts", v)} />
              <Money id="final" label="Final expenses" value={form.finalExpenses} onChange={(v) => set("finalExpenses", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="savings" label="Existing savings" value={form.existingSavings} onChange={(v) => set("existingSavings", v)} />
              <Money id="coverage" label="Existing cover" value={form.existingCoverage} onChange={(v) => set("existingCoverage", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Recommended cover</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.recommendedCoverage) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total need</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalNeed)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Savings and cover</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.offsets)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && parts.length > 0 && <NeedsBreakdown parts={parts} total={result.totalNeed} />}
    </div>
  );
}

function NeedsBreakdown({ parts, total }: { parts: { label: string; value: number; color: string }[]; total: number }) {
  const safeTotal = total > 0 ? total : 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">What makes up the total need</h3>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100">
        {parts.map((p) => (
          <div key={p.label} className={p.color} style={{ width: `${(p.value / safeTotal) * 100}%` }} title={p.label} />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-zinc-500">
              <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
              {p.label}
            </span>
            <span className="font-bold tabular-nums text-zinc-900">
              {formatUSD(p.value)} <span className="font-medium text-zinc-400">({((p.value / safeTotal) * 100).toFixed(0)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
