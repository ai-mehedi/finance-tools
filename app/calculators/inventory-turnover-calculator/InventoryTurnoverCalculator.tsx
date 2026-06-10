"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeInventoryTurnover,
  formatUSD,
  formatNumber,
  type InventoryTurnoverResult,
} from "@/lib/calculators/inventory-turnover";

type FormState = {
  cogs: string;
  averageInventory: string;
  daysInPeriod: string;
};

const DEFAULTS: FormState = {
  cogs: "500000",
  averageInventory: "80000",
  daysInPeriod: "365",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): InventoryTurnoverResult | null {
  return computeInventoryTurnover({
    cogs: num(f.cogs) || 0,
    averageInventory: num(f.averageInventory),
    daysInPeriod: num(f.daysInPeriod),
  });
}

export default function InventoryTurnoverCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<InventoryTurnoverResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a cost of goods sold, plus an average inventory and period above 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Enter the figures</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="cogs">Cost of goods sold</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="cogs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cogs} onChange={(e) => set("cogs", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="avg">Average inventory</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="avg" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.averageInventory} onChange={(e) => set("averageInventory", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="days">Days in period</Label>
                <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.daysInPeriod} onChange={(e) => set("daysInPeriod", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Turnover ratio</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${formatNumber(result.turnoverRatio)}x` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Days inventory on hand</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.daysOnHand)} days</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Cost of goods sold per day</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.dailyCogs)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Turns per month</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.turnsPerMonth)}x</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Cumulative turns chart */}
      {result && result.schedule.length > 1 && <TurnsChart result={result} />}
    </div>
  );
}

function TurnsChart({ result }: { result: InventoryTurnoverResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.cumulativeTurns)) || 1;
  const n = data.length;

  const bw = innerW / n;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative stock cycles across the year</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500"><span className="h-2 w-3 rounded-sm bg-orange-400/70" /> Turns</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative inventory turns chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{g.v.toFixed(1)}x</text>
          </g>
        ))}
        <defs>
          <linearGradient id="itBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const bx = pad.l + i * bw + bw * 0.18;
          const by = y(p.cumulativeTurns);
          const bh = pad.t + innerH - by;
          return (
            <rect key={i} x={bx} y={by} width={bw * 0.64} height={Math.max(0, bh)} rx={2} fill="url(#itBar)" />
          );
        })}
        {data.map((p, i) => (
          <text key={i} x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{monthLabels[i]}</text>
        ))}
      </svg>
    </div>
  );
}
