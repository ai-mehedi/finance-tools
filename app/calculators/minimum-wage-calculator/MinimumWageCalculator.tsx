"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeMinimumWage,
  formatUSD,
  formatCompact,
  type MinimumWageResult,
} from "@/lib/calculators/minimum-wage";

type FormState = {
  hourlyWage: string;
  hoursPerWeek: string;
  weeksPerYear: string;
  overtimeThreshold: string;
  overtimeMultiplier: string;
};

const DEFAULTS: FormState = {
  hourlyWage: "7.25",
  hoursPerWeek: "40",
  weeksPerYear: "52",
  overtimeThreshold: "40",
  overtimeMultiplier: "1.5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MinimumWageResult | null {
  return computeMinimumWage({
    hourlyWage: num(f.hourlyWage),
    hoursPerWeek: num(f.hoursPerWeek),
    weeksPerYear: num(f.weeksPerYear),
    overtimeThreshold: num(f.overtimeThreshold),
    overtimeMultiplier: num(f.overtimeMultiplier),
  });
}

export default function MinimumWageCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MinimumWageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative wage, positive weekly hours, weeks between 1 and 53, and an overtime multiplier of at least 1.");
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
        { label: "Regular pay (weekly)", value: result.regularWeekly, color: "bg-orange-300" },
        { label: "Overtime pay (weekly)", value: result.overtimeWeekly, color: "bg-orange-500" },
        { label: "Take-home per week", value: result.weeklyGross, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your wage and schedule, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wage">Hourly wage</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="wage" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.hourlyWage} onChange={(e) => set("hourlyWage", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="hours">Hours / week</Label>
                <Input id="hours" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="weeks">Weeks / year</Label>
                <Input id="weeks" type="number" min={1} max={53} step="any" inputMode="decimal" className="h-11" value={form.weeksPerYear} onChange={(e) => set("weeksPerYear", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ot">OT after (hrs)</Label>
                <Input id="ot" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.overtimeThreshold} onChange={(e) => set("overtimeThreshold", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mult">OT multiplier</Label>
                <Input id="mult" type="number" min={1} step="any" inputMode="decimal" className="h-11" value={form.overtimeMultiplier} onChange={(e) => set("overtimeMultiplier", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Annual gross pay</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.annualGross) : "—"}
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

      {/* Earnings by pay period */}
      {result && <PeriodChart result={result} />}
    </div>
  );
}

function PeriodChart({ result }: { result: MinimumWageResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.amount)) || 1;

  const barGap = 18;
  const barW = (innerW - barGap * (data.length - 1)) / data.length;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Gross earnings by pay period</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500"><span className="h-2 w-3 rounded-sm bg-orange-400/70" /> Gross pay</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Minimum wage earnings by pay period chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="mwFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const bx = pad.l + i * (barW + barGap);
          const by = y(p.amount);
          const bh = pad.t + innerH - by;
          return (
            <g key={p.label}>
              <rect x={bx} y={by} width={barW} height={Math.max(0, bh)} rx={4} fill="url(#mwFill)" stroke="#f97316" strokeWidth={1} />
              <text x={bx + barW / 2} y={H - 20} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{p.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
