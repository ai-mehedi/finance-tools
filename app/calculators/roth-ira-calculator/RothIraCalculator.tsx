"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRothIra,
  formatUSD,
  formatCompact,
  type RothIraResult,
} from "@/lib/calculators/roth-ira";

type FormState = {
  currentAge: string;
  retirementAge: string;
  startingBalance: string;
  annualContribution: string;
  annualReturnPct: string;
  taxRatePct: string;
};

const DEFAULTS: FormState = {
  currentAge: "30",
  retirementAge: "65",
  startingBalance: "5000",
  annualContribution: "7000",
  annualReturnPct: "7",
  taxRatePct: "24",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RothIraResult | null {
  return computeRothIra({
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    startingBalance: num(f.startingBalance) || 0,
    annualContribution: num(f.annualContribution) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    taxRatePct: num(f.taxRatePct) || 0,
  });
}

export default function RothIraCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RothIraResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Retirement age must be greater than your current age, with a valid tax rate from 0 to 100.");
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
        { label: "Total contributed", value: result.totalContributed, color: "bg-zinc-300" },
        { label: "Tax-free growth", value: result.totalGrowth, color: "bg-orange-400" },
        { label: "Roth advantage vs taxable", value: result.taxesSaved, color: "bg-orange-500" },
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
                <Label htmlFor="curAge">Current age</Label>
                <Input id="curAge" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retAge">Retirement age</Label>
                <Input id="retAge" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Current balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="start" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.startingBalance} onChange={(e) => set("startingBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="contrib">Annual contribution</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualContribution} onChange={(e) => set("annualContribution", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ret">Annual return (% / yr)</Label>
                <Input id="ret" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualReturnPct} onChange={(e) => set("annualReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tax">Tax rate (%)</Label>
                <Input id="tax" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
              </div>
            </div>

            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
            {result?.capApplied && (
              <p className="text-xs font-medium text-amber-600">
                Contribution capped to the IRS limit of {formatUSD(result.appliedContribution)} for this age.
              </p>
            )}

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Tax-free balance at retirement</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.rothBalance) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              A taxable account would leave about {formatUSD(result.taxableBalance)} after tax.
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

      {/* Growth chart */}
      {result && result.schedule.length > 1 && <GrowthChart result={result} />}
    </div>
  );
}

function GrowthChart({ result }: { result: RothIraResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const startAge = data[0].age;
  const endAge = data[data.length - 1].age;
  const span = endAge - startAge || 1;
  const maxVal = Math.max(...data.map((p) => p.rothBalance)) || 1;

  const x = (age: number) => pad.l + ((age - startAge) / span) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const rothPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.rothBalance).toFixed(1)}`);
  const taxablePts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.taxableBalance).toFixed(1)}`);
  const areaPath = `M${x(startAge)},${y(0)} L${rothPts.join(" L")} L${x(endAge)},${y(0)} Z`;
  const rothLine = `M${rothPts.join(" L")}`;
  const taxableLine = `M${taxablePts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [startAge, Math.round((startAge + endAge) / 2), endAge].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Roth vs taxable over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Roth (tax free)</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Taxable</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Roth IRA growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="rothFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#rothFill)" />
        <path d={rothLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={taxableLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>age {t}</text>
        ))}
      </svg>
    </div>
  );
}
