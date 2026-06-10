"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeGrossProfit,
  formatUSD,
  formatCompact,
  type GrossProfitResult,
} from "@/lib/calculators/gross-profit";

type FormState = {
  revenue: string;
  cogs: string;
  unitsSold: string;
};

const DEFAULTS: FormState = {
  revenue: "120000",
  cogs: "78000",
  unitsSold: "4000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GrossProfitResult | null {
  return computeGrossProfit({
    revenue: num(f.revenue),
    cogs: num(f.cogs) || 0,
    unitsSold: num(f.unitsSold) || 0,
  });
}

export default function GrossProfitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<GrossProfitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter revenue greater than 0 and a non-negative cost of goods sold.");
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
        { label: "Revenue", value: result.revenue, color: "bg-zinc-300" },
        { label: "Cost of goods sold", value: result.cogs, color: "bg-orange-300" },
        { label: "Gross profit", value: result.grossProfit, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your sales figures, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revenue">Total revenue</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cogs">Cost of goods sold</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cogs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cogs} onChange={(e) => set("cogs", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="units">Units sold (optional)</Label>
              <Input id="units" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.unitsSold} onChange={(e) => set("unitsSold", e.target.value)} />
              <p className="mt-1 text-xs text-zinc-400">Add units to see per-unit revenue, cost and profit.</p>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Gross profit</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.grossProfit) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {result.grossMarginPct.toFixed(1)}% gross margin
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

      {result && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Gross margin" value={`${result.grossMarginPct.toFixed(1)}%`} hint="Profit per dollar of sales" />
          <Metric label="Markup on cost" value={`${result.markupPct.toFixed(1)}%`} hint="Profit per dollar of cost" />
          <Metric
            label="Profit per unit"
            value={result.hasUnits ? formatUSD(result.perUnitProfit) : "—"}
            hint={result.hasUnits ? `${formatUSD(result.perUnitRevenue)} price - ${formatUSD(result.perUnitCost)} cost` : "Add units sold"}
          />
        </div>
      )}

      {result && <ProfitChart result={result} />}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function ProfitChart({ result }: { result: GrossProfitResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.bars;
  const maxVal = Math.max(...data.map((d) => d.value)) || 1;

  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.5, 90);
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Revenue, cost and profit</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Gross profit bar chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(d.value);
          const h = pad.t + innerH - top;
          return (
            <g key={d.label}>
              <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(h, 0)} rx={5} fill={d.color} />
              <text x={cx} y={top - 6} textAnchor="middle" className="fill-zinc-500" fontSize={10} fontWeight={700}>{formatCompact(d.value)}</text>
              <text x={cx} y={H - 12} textAnchor="middle" className="fill-zinc-500" fontSize={11}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
