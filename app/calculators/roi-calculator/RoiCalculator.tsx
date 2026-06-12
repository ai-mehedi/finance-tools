"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRoi,
  formatUSD,
  formatCompact,
  type RoiResult,
} from "@/lib/calculators/roi";

type FormState = {
  initialInvestment: string;
  finalValue: string;
  additionalCosts: string;
  holdingYears: string;
};

const DEFAULTS: FormState = {
  initialInvestment: "10000",
  finalValue: "16500",
  additionalCosts: "150",
  holdingYears: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RoiResult | null {
  return computeRoi({
    initialInvestment: num(f.initialInvestment),
    finalValue: num(f.finalValue) || 0,
    additionalCosts: num(f.additionalCosts) || 0,
    holdingYears: num(f.holdingYears) || 0,
  });
}

const pct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;

export default function RoiCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RoiResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an initial investment greater than 0 and non-negative values.");
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

  const hasHorizon = (num(form.holdingYears) || 0) > 0;
  const breakdown = result
    ? [
        { label: "Total cost", value: result.totalCost, color: "bg-zinc-300" },
        { label: "Net profit", value: result.netProfit, color: "bg-orange-400" },
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
                <Label htmlFor="initial">Initial investment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="initial" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initialInvestment} onChange={(e) => set("initialInvestment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="final">Final value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="final" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.finalValue} onChange={(e) => set("finalValue", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="costs">Fees &amp; extra costs</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="costs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.additionalCosts} onChange={(e) => set("additionalCosts", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="years">Holding period (yrs)</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.holdingYears} onChange={(e) => set("holdingYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Return on investment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? pct(result.roiPct) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.multiple.toFixed(2)}x your cost
              {hasHorizon ? ` · ${pct(result.annualizedPct)} per year` : ""}
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
                  <span className={`text-sm font-bold tabular-nums ${b.label === "Net profit" && b.value < 0 ? "text-rose-600" : "text-zinc-900"}`}>{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Growth chart */}
      {result && hasHorizon && result.schedule.length > 1 && <RoiChart result={result} />}
    </div>
  );
}

function RoiChart({ result }: { result: RoiResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const cost = data[0]?.value || 1;
  const maxVal = Math.max(...data.map((p) => p.value), cost) || 1;
  const minVal = Math.min(...data.map((p) => p.value), cost, 0);
  const range = maxVal - minVal || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / range) * innerH;

  const valPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(minVal)} L${valPts.join(" L")} L${x(years)},${y(minVal)} Z`;
  const valLine = `M${valPts.join(" L")}`;
  const costY = y(cost);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Value over the holding period</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Value</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Cost basis</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="ROI value growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#roiFill)" />
        <line x1={pad.l} y1={costY} x2={W - pad.r} y2={costY} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={valLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
