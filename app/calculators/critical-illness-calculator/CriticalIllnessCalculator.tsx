"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCriticalIllness,
  formatUSD,
  formatCompact,
  type CriticalIllnessResult,
} from "@/lib/calculators/critical-illness";

type FormState = {
  annualIncome: string;
  incomeYears: string;
  monthlyExpenses: string;
  outstandingDebt: string;
  treatmentCost: string;
  existingCover: string;
};

const DEFAULTS: FormState = {
  annualIncome: "60000",
  incomeYears: "3",
  monthlyExpenses: "3000",
  outstandingDebt: "180000",
  treatmentCost: "25000",
  existingCover: "50000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CriticalIllnessResult | null {
  return computeCriticalIllness({
    annualIncome: num(f.annualIncome) || 0,
    incomeYears: num(f.incomeYears),
    monthlyExpenses: num(f.monthlyExpenses) || 0,
    outstandingDebt: num(f.outstandingDebt) || 0,
    treatmentCost: num(f.treatmentCost) || 0,
    existingCover: num(f.existingCover) || 0,
  });
}

export default function CriticalIllnessCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CriticalIllnessResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative number of years and non-negative amounts.");
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
                <Label htmlFor="income">Annual income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="years">Income years to cover</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.incomeYears} onChange={(e) => set("incomeYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expenses">Monthly expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyExpenses} onChange={(e) => set("monthlyExpenses", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="debt">Outstanding debt</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debt" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.outstandingDebt} onChange={(e) => set("outstandingDebt", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="treatment">Treatment costs</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="treatment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.treatmentCost} onChange={(e) => set("treatmentCost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="existing">Existing cover</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="existing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingCover} onChange={(e) => set("existingCover", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Cover you should buy</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.coverGap) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total cover need</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.recommendedCover)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Income replacement</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.incomeReplacement)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Debt + treatment + buffer</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {formatUSD(result.debtClearing + result.treatment + result.expenseBuffer)}
                  </span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Donut of where the cover goes */}
      {result && result.recommendedCover > 0 && <CoverDonut result={result} />}
    </div>
  );
}

function CoverDonut({ result }: { result: CriticalIllnessResult }) {
  const total = result.recommendedCover || 1;
  const cx = 90;
  const cy = 90;
  const r = 66;
  const stroke = 26;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segments = result.components
    .filter((c) => c.value > 0)
    .map((c) => {
      const frac = c.value / total;
      const seg = {
        ...c,
        frac,
        dash: frac * circ,
        gap: circ - frac * circ,
        rotation: (offset / total) * 360 - 90,
      };
      offset += c.value;
      return seg;
    });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the cover goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="Cover breakdown donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`}
              transform={`rotate(${s.rotation.toFixed(2)} ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={18} fontWeight={700}>
            {formatCompact(result.recommendedCover)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            total need
          </text>
        </svg>
        <ul className="flex-1 space-y-2">
          {result.components.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-zinc-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </span>
              <span className="font-bold tabular-nums text-zinc-900">{formatUSD(c.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
