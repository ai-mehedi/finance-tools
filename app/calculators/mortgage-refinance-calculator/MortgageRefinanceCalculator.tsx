"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRefinance,
  formatUSD,
  formatCompact,
  type RefinanceResult,
} from "@/lib/calculators/mortgage-refinance";

type FormState = {
  currentBalance: string;
  currentRatePct: string;
  currentRemainingYears: string;
  newRatePct: string;
  newTermYears: string;
  closingCosts: string;
};

const DEFAULTS: FormState = {
  currentBalance: "280000",
  currentRatePct: "6.8",
  currentRemainingYears: "27",
  newRatePct: "5.5",
  newTermYears: "30",
  closingCosts: "4500",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RefinanceResult | null {
  return computeRefinance({
    currentBalance: num(f.currentBalance),
    currentRatePct: num(f.currentRatePct) || 0,
    currentRemainingYears: num(f.currentRemainingYears),
    newRatePct: num(f.newRatePct) || 0,
    newTermYears: num(f.newTermYears),
    closingCosts: num(f.closingCosts) || 0,
  });
}

export default function MortgageRefinanceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RefinanceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive balance, loan terms greater than 0, and non-negative rates.");
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

  const savingsPositive = result ? result.monthlySavings >= 0 : false;

  const breakdown = result
    ? [
        { label: "Current payment", value: result.currentPayment, color: "bg-zinc-300" },
        { label: "New payment", value: result.newPayment, color: "bg-orange-300" },
        { label: "Lifetime interest saved", value: result.lifetimeInterestSavings, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your loan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Compare your current mortgage with a new one, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="balance">Remaining balance</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentBalance} onChange={(e) => set("currentBalance", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curRate">Current rate (% / yr)</Label>
                <Input id="curRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentRatePct} onChange={(e) => set("currentRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="curYears">Years left</Label>
                <Input id="curYears" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentRemainingYears} onChange={(e) => set("currentRemainingYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="newRate">New rate (% / yr)</Label>
                <Input id="newRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newRatePct} onChange={(e) => set("newRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newTerm">New term (yrs)</Label>
                <Input id="newTerm" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newTermYears} onChange={(e) => set("newTermYears", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="closing">Closing costs</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="closing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.closingCosts} onChange={(e) => set("closingCosts", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly savings</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(Math.abs(result.monthlySavings)) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {savingsPositive ? "lower each month" : "higher each month"}
              {result.breakEvenMonths !== null
                ? ` · break-even in ${result.breakEvenMonths} mo`
                : " · does not break even"}
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

      {/* Break-even chart */}
      {result && result.schedule.length > 1 && <BreakEvenChart result={result} />}
    </div>
  );
}

function BreakEvenChart({ result }: { result: RefinanceResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxMonth = data[data.length - 1].month || 1;
  const vals = data.map((p) => p.cumulativeSavings);
  const maxVal = Math.max(...vals, 0);
  const minVal = Math.min(...vals, 0);
  const range = maxVal - minVal || 1;

  const x = (mo: number) => pad.l + (mo / maxMonth) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / range) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.cumulativeSavings).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const zeroY = y(0);
  const areaPath = `M${x(0)},${zeroY} L${pts.join(" L")} L${x(maxMonth)},${zeroY} Z`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(maxMonth / 2), maxMonth].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative savings after costs</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Net savings</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-300" /> Break-even</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Refinance break-even chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="refiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#refiFill)" />
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{Math.round(t / 12)} yr</text>
        ))}
      </svg>
    </div>
  );
}
