"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeMarkup,
  formatUSD,
  formatCompact,
  type MarkupResult,
} from "@/lib/calculators/markup";

type FormState = {
  cost: string;
  markupPct: string;
};

const DEFAULTS: FormState = {
  cost: "50",
  markupPct: "60",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MarkupResult | null {
  return computeMarkup({
    cost: num(f.cost),
    markupPct: num(f.markupPct),
  });
}

export default function MarkupCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MarkupResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative cost and a markup percentage of 0 or more.");
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
        { label: "Cost", value: result.cost, color: "bg-zinc-300" },
        { label: "Profit per unit", value: result.profit, color: "bg-orange-500" },
        { label: "Selling price", value: result.price, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your unit cost and markup, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost">Unit cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="markup">Markup (%)</Label>
                <Input id="markup" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.markupPct} onChange={(e) => set("markupPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Selling price</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.price) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                      {b.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Equivalent margin</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.marginPct.toFixed(1)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Markup comparison chart */}
      {result && result.schedule.length > 1 && <MarkupChart result={result} />}
    </div>
  );
}

function MarkupChart({ result }: { result: MarkupResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxPrice = Math.max(...data.map((d) => d.price), 1);
  const gap = 10;
  const bw = (innerW - gap * (data.length - 1)) / data.length;

  const y = (v: number) => pad.t + innerH - (v / maxPrice) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxPrice / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Price at different markups</h3>
        <span className="text-xs text-zinc-500">Cost {formatCompact(result.cost)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Selling price by markup bar chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const bx = pad.l + i * (bw + gap);
          const top = y(d.price);
          const h = pad.t + innerH - top;
          const isChosen = d.markupPct === Math.round(result.markupPct);
          return (
            <g key={i}>
              <rect x={bx} y={top} width={bw} height={Math.max(0, h)} rx={4} fill={isChosen ? "#f97316" : "#fb923c"} opacity={isChosen ? 1 : 0.5} />
              <text x={bx + bw / 2} y={H - 10} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{d.markupPct}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
