"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRmd,
  formatUSD,
  formatCompact,
  type RmdResult,
} from "@/lib/calculators/rmd";

type FormState = {
  age: string;
  balance: string;
  annualReturnPct: string;
  projectionYears: string;
};

const DEFAULTS: FormState = {
  age: "73",
  balance: "500000",
  annualReturnPct: "5",
  projectionYears: "15",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RmdResult | null {
  return computeRmd({
    age: num(f.age),
    balance: num(f.balance) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    projectionYears: num(f.projectionYears),
  });
}

const pct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;

export default function RmdCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RmdResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a valid age, at least 1 projection year, and a non-negative balance.");
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
        { label: "Distribution period", value: result.factor.toFixed(1), color: "bg-zinc-300" },
        { label: "Percent of balance", value: pct(result.percentOfBalance), color: "bg-orange-400" },
        { label: "Total over projection", value: formatUSD(result.totalWithdrawn), color: "bg-orange-500" },
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
                <Label htmlFor="age">Your age</Label>
                <Input id="age" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="balance">Prior year-end balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="return">Assumed return (% / yr)</Label>
                <Input id="return" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualReturnPct} onChange={(e) => set("annualReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years to project</Label>
                <Input id="years" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.projectionYears} onChange={(e) => set("projectionYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">This year&apos;s RMD</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.rmd) : "—"}
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

      {/* RMD by age chart */}
      {result && result.schedule.length > 1 && <RmdChart result={result} />}
    </div>
  );
}

function RmdChart({ result }: { result: RmdResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.rmd)) || 1;
  const n = data.length;
  const slot = innerW / n;
  const barW = Math.max(2, slot * 0.62);

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  // Show roughly five age labels along the axis.
  const labelEvery = Math.max(1, Math.ceil(n / 5));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Projected RMD by age</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Required withdrawal</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected required minimum distribution by age">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="rmdBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const cx = pad.l + slot * i + (slot - barW) / 2;
          const top = y(p.rmd);
          const h = pad.t + innerH - top;
          return <rect key={i} x={cx} y={top} width={barW} height={Math.max(0, h)} rx={2} fill="url(#rmdBar)" />;
        })}
        {data.map((p, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={`t${i}`} x={pad.l + slot * i + slot / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.age}</text>
          ) : null
        )}
      </svg>
    </div>
  );
}
