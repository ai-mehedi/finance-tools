"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLoanRefinance,
  formatUSD,
  formatCompact,
  formatDuration,
  type LoanRefinanceResult,
} from "@/lib/calculators/loan-refinance";

type FormState = {
  balance: string;
  currentRatePct: string;
  remainingYears: string;
  newRatePct: string;
  newTermYears: string;
  closingCosts: string;
};

const DEFAULTS: FormState = {
  balance: "220000",
  currentRatePct: "7.2",
  remainingYears: "25",
  newRatePct: "5.8",
  newTermYears: "25",
  closingCosts: "4500",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LoanRefinanceResult | null {
  return computeLoanRefinance({
    balance: num(f.balance),
    currentRatePct: num(f.currentRatePct),
    remainingYears: num(f.remainingYears),
    newRatePct: num(f.newRatePct),
    newTermYears: num(f.newTermYears),
    closingCosts: num(f.closingCosts) || 0,
  });
}

export default function LoanRefinanceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LoanRefinanceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive balance, both rates, and terms in years greater than 0.");
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
        { label: "New monthly payment", value: formatUSD(result.newPayment), color: "bg-orange-500" },
        { label: "Monthly savings", value: formatUSD(result.monthlySavings), color: "bg-emerald-400" },
        { label: "Break-even point", value: result.breakEvenMonths ? formatDuration(result.breakEvenMonths) : "Never", color: "bg-orange-300" },
        { label: "Lifetime savings", value: formatUSD(result.lifetimeSavings), color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Current loan vs. new offer</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter both loans and the closing costs, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="balance">Balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="curRate">Current rate (%)</Label>
                <Input id="curRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentRatePct} onChange={(e) => set("currentRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="remYears">Years left</Label>
                <Input id="remYears" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.remainingYears} onChange={(e) => set("remainingYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="newRate">New rate (%)</Label>
                <Input id="newRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newRatePct} onChange={(e) => set("newRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newTerm">New term (yrs)</Label>
                <Input id="newTerm" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newTermYears} onChange={(e) => set("newTermYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="closing">Closing costs</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="closing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.closingCosts} onChange={(e) => set("closingCosts", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly savings</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlySavings) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Cumulative cost chart */}
      {result && result.schedule.length > 1 && <RefinanceChart result={result} />}
    </div>
  );
}

function RefinanceChart({ result }: { result: LoanRefinanceResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(
    ...data.map((p) => Math.max(p.currentCumulative, p.refiCumulative))
  ) || 1;

  const x = (mo: number) => pad.l + (mo / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const refiPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.refiCumulative).toFixed(1)}`);
  const curPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.currentCumulative).toFixed(1)}`);
  const refiLine = `M${refiPts.join(" L")}`;
  const curLine = `M${curPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  const be = result.breakEvenMonths;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative cost over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Refinance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Keep current</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Refinance cumulative cost comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {be && be <= months && (
          <line x1={x(be)} y1={pad.t} x2={x(be)} y2={pad.t + innerH} stroke="#10b981" strokeWidth={1.25} strokeDasharray="3 3" />
        )}
        <path d={curLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        <path d={refiLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
