"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeTuitionInflation,
  formatUSD,
  formatCompact,
  type TuitionInflationResult,
} from "@/lib/calculators/tuition-inflation";

type FormState = {
  currentAnnualCost: string;
  yearsUntilStart: string;
  yearsOfStudy: string;
  inflationPct: string;
  currentSavings: string;
  savingsReturnPct: string;
};

const DEFAULTS: FormState = {
  currentAnnualCost: "28000",
  yearsUntilStart: "12",
  yearsOfStudy: "4",
  inflationPct: "5",
  currentSavings: "10000",
  savingsReturnPct: "6",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TuitionInflationResult | null {
  return computeTuitionInflation({
    currentAnnualCost: num(f.currentAnnualCost) || 0,
    yearsUntilStart: num(f.yearsUntilStart),
    yearsOfStudy: num(f.yearsOfStudy),
    inflationPct: num(f.inflationPct) || 0,
    currentSavings: num(f.currentSavings) || 0,
    savingsReturnPct: num(f.savingsReturnPct) || 0,
  });
}

export default function TuitionInflationCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TuitionInflationResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative cost, a years-until-start of 0 or more, and at least 1 year of study.");
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
        { label: "First year of college", value: result.firstYearCost, color: "bg-orange-300" },
        { label: "Total across all years", value: result.totalCost, color: "bg-orange-500" },
        { label: "Same bill at today's prices", value: result.costInTodaysDollars, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost">Annual cost today</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentAnnualCost} onChange={(e) => set("currentAnnualCost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="inflation">Tuition inflation (% / yr)</Label>
                <Input id="inflation" type="number" step="any" inputMode="decimal" className="h-11" value={form.inflationPct} onChange={(e) => set("inflationPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Years until start</Label>
                <Input id="start" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsUntilStart} onChange={(e) => set("yearsUntilStart", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="study">Years of study</Label>
                <Input id="study" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.yearsOfStudy} onChange={(e) => set("yearsOfStudy", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="savings">Saved so far</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="savings" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="return">Savings return (% / yr)</Label>
                <Input id="return" type="number" step="any" inputMode="decimal" className="h-11" value={form.savingsReturnPct} onChange={(e) => set("savingsReturnPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Projected total cost</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalCost) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Save about{" "}
              <span className="font-bold text-orange-600">{formatUSD(result.monthlySavingsNeeded)}</span>/mo to fund it
            </p>
          )}
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

      {/* Rising-cost chart */}
      {result && result.schedule.length > 0 && <CostChart result={result} />}
    </div>
  );
}

function CostChart({ result }: { result: TuitionInflationResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const maxVal = Math.max(...data.map((p) => p.annualCost)) || 1;

  // Bar chart: one bar per academic year, height = inflated cost of that year.
  const barGap = 14;
  const barW = (innerW - barGap * (n - 1)) / n;

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cost per academic year</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="h-2 w-3 rounded-sm bg-orange-400" /> Inflated tuition
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Tuition cost per year chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="tuiBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const x = pad.l + i * (barW + barGap);
          const yy = y(p.annualCost);
          const h = pad.t + innerH - yy;
          return (
            <g key={i}>
              <rect x={x} y={yy} width={barW} height={h} rx={4} fill="url(#tuiBar)" />
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
                Yr {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
