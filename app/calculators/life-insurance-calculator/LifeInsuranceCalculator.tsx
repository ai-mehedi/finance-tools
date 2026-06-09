"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLifeInsurance,
  formatUSD,
  type LifeInsuranceResult,
} from "@/lib/calculators/life-insurance";

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
  annualIncome: "70000",
  yearsToReplace: "10",
  mortgageBalance: "220000",
  otherDebts: "20000",
  educationCosts: "100000",
  finalExpenses: "15000",
  existingSavings: "50000",
  existingCoverage: "50000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LifeInsuranceResult | null {
  return computeLifeInsurance({
    annualIncome: num(f.annualIncome) || 0,
    yearsToReplace: num(f.yearsToReplace),
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

export default function LifeInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LifeInsuranceResult | null>(() => compute(DEFAULTS));
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
              <Money id="education" label="Education costs" value={form.educationCosts} onChange={(v) => set("educationCosts", v)} />
              <Money id="final" label="Final expenses" value={form.finalExpenses} onChange={(v) => set("finalExpenses", v)} />
            </div>

            <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-600 [&::-webkit-details-marker]:hidden">
                What you already have (optional)
                <span className="text-xs text-zinc-400 group-open:hidden">Show</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Money id="savings" label="Savings & investments" value={form.existingSavings} onChange={(v) => set("existingSavings", v)} />
                <Money id="coverage" label="Existing coverage" value={form.existingCoverage} onChange={(v) => set("existingCoverage", v)} />
              </div>
            </details>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Coverage you need</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.coverageNeeded) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total needs</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalNeeds)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Savings & coverage</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalOffsets)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Based on the DIME method: debt, income, mortgage and education, less what you already have.
            </p>
          )}
        </div>
      </form>

      {result && <NeedsChart result={result} />}
    </div>
  );
}

function NeedsChart({ result }: { result: LifeInsuranceResult }) {
  const rows = result.components.filter((c) => c.value !== 0);
  const maxVal = Math.max(...rows.map((r) => Math.abs(r.value)), 1);

  const W = 640;
  const rowH = 46;
  const H = rows.length * rowH + 16;
  const labelW = 150;
  const barMax = W - labelW - 130;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">What makes up your coverage need</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Life insurance coverage need breakdown chart">
        {rows.map((r, i) => {
          const yTop = i * rowH + 10;
          const w = (Math.abs(r.value) / maxVal) * barMax;
          const offset = r.value < 0;
          return (
            <g key={r.label}>
              <text x={0} y={yTop + 19} className="fill-zinc-600" fontSize={12} fontWeight={600}>{r.label}</text>
              <rect x={labelW} y={yTop} width={Math.max(2, w)} height={24} rx={5} fill={offset ? "#d4d4d8" : "#f97316"} />
              <text x={labelW + Math.max(2, w) + 8} y={yTop + 17} className="fill-zinc-900" fontSize={12} fontWeight={700}>
                {offset ? "-" : ""}{formatUSD(Math.abs(r.value))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
