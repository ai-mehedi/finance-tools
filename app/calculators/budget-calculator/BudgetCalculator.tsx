"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBudget,
  formatUSD,
  type BudgetResult,
} from "@/lib/calculators/budget";

type FormState = { monthlyIncome: string };

const DEFAULTS: FormState = { monthlyIncome: "5000" };

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BudgetResult | null {
  return computeBudget({ monthlyIncome: num(f.monthlyIncome) });
}

export default function BudgetCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BudgetResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative monthly income.");
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

  const breakdown = result
    ? [
        { label: "Needs (50%)", value: result.needs, pct: 50, color: "bg-orange-500", fill: "#f97316" },
        { label: "Wants (30%)", value: result.wants, pct: 30, color: "bg-amber-400", fill: "#fbbf24" },
        { label: "Savings (20%)", value: result.savings, pct: 20, color: "bg-orange-300", fill: "#fdba74" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your monthly income</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your take-home pay, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Monthly after-tax income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly income</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(num(form.monthlyIncome) || 0) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Breakdown bar */}
      {result && <BreakdownBar breakdown={breakdown} />}
    </div>
  );
}

function BreakdownBar({
  breakdown,
}: {
  breakdown: { label: string; value: number; pct: number; color: string; fill: string }[];
}) {
  const W = 640;
  const H = 36;
  let cursor = 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">50/30/20 breakdown</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {breakdown.map((b) => (
            <span key={b.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-3 rounded-sm ${b.color}`} /> {b.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="50/30/20 budget breakdown bar">
        {breakdown.map((b) => {
          const segW = (b.pct / 100) * W;
          const x = cursor;
          cursor += segW;
          return (
            <g key={b.label}>
              <rect x={x} y={0} width={segW} height={H} fill={b.fill} rx={0} />
              {b.pct >= 12 && (
                <text x={x + segW / 2} y={H / 2 + 4} textAnchor="middle" className="fill-white" fontSize={12} fontWeight={700}>
                  {b.pct}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
