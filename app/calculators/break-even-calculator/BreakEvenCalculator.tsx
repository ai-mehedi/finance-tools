"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBreakEven,
  formatUSD,
  formatUSD2,
  formatCompact,
  formatUnits,
  type BreakEvenResult,
} from "@/lib/calculators/break-even";

type FormState = {
  fixedCosts: string;
  pricePerUnit: string;
  variableCostPerUnit: string;
};

const DEFAULTS: FormState = {
  fixedCosts: "20000",
  pricePerUnit: "50",
  variableCostPerUnit: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BreakEvenResult | null {
  return computeBreakEven({
    fixedCosts: num(f.fixedCosts) || 0,
    pricePerUnit: num(f.pricePerUnit) || 0,
    variableCostPerUnit: num(f.variableCostPerUnit) || 0,
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function BreakEvenCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BreakEvenResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a price above the variable cost per unit, with non-negative fixed costs.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Cost and price details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="fixed" label="Total fixed costs" value={form.fixedCosts} onChange={(v) => set("fixedCosts", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Money id="price" label="Price per unit" value={form.pricePerUnit} onChange={(v) => set("pricePerUnit", v)} />
              <Money id="varcost" label="Variable cost / unit" value={form.variableCostPerUnit} onChange={(v) => set("variableCostPerUnit", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Break-even units</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUnits(result.breakEvenUnits) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Break-even revenue</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.breakEvenRevenue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Contribution margin</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.contributionMargin)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Margin of price</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.contributionMarginPct.toFixed(1)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Each unit contributes <span className="font-semibold text-zinc-600">{formatUSD2(result.contributionMargin)}</span> toward fixed costs and profit.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <BreakEvenChart result={result} />}
    </div>
  );
}

function BreakEvenChart({ result }: { result: BreakEvenResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxUnits = data[data.length - 1].units || 1;
  const maxVal =
    Math.max(...data.map((p) => Math.max(p.revenue, p.totalCost))) || 1;

  const x = (u: number) => pad.l + (u / maxUnits) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const revPts = data.map((p) => `${x(p.units).toFixed(1)},${y(p.revenue).toFixed(1)}`);
  const costPts = data.map((p) => `${x(p.units).toFixed(1)},${y(p.totalCost).toFixed(1)}`);
  const revLine = `M${revPts.join(" L")}`;
  const costLine = `M${costPts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });

  const beX = x(result.breakEvenUnits);
  const beY = y(result.breakEvenRevenue);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Revenue vs total cost</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Revenue</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Total cost</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Break-even revenue versus cost chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {result.breakEvenUnits <= maxUnits && (
          <g>
            <line x1={beX} y1={pad.t} x2={beX} y2={pad.t + innerH} stroke="#fbbf24" strokeWidth={1} strokeDasharray="4 3" />
            <circle cx={beX} cy={beY} r={4} fill="#f97316" />
          </g>
        )}
        <path d={costLine} fill="none" stroke="#a1a1aa" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={revLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <text x={pad.l} y={H - 8} textAnchor="start" className="fill-zinc-400" fontSize={10}>0 units</text>
        <text x={W - pad.r} y={H - 8} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatUnits(maxUnits)} units</text>
      </svg>
    </div>
  );
}
