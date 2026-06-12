"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeStp,
  formatUSD,
  formatCompact,
  type StpResult,
} from "@/lib/calculators/stp";

type FormState = {
  sourceLumpSum: string;
  monthlyTransfer: string;
  sourceRatePct: string;
  targetRatePct: string;
  years: string;
};

const DEFAULTS: FormState = {
  sourceLumpSum: "600000",
  monthlyTransfer: "10000",
  sourceRatePct: "6",
  targetRatePct: "12",
  years: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): StpResult | null {
  return computeStp({
    sourceLumpSum: num(f.sourceLumpSum) || 0,
    monthlyTransfer: num(f.monthlyTransfer) || 0,
    sourceRatePct: num(f.sourceRatePct) || 0,
    targetRatePct: num(f.targetRatePct) || 0,
    years: num(f.years),
  });
}

export default function StpCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<StpResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a source lump sum above 0, a horizon above 0 and non-negative rates.");
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
        { label: "Target fund value", value: result.targetBalance, color: "bg-orange-500" },
        { label: "Source fund left", value: result.sourceBalance, color: "bg-orange-300" },
        { label: "Total transferred", value: result.totalTransferred, color: "bg-zinc-300" },
        { label: "Total gains", value: result.totalGains, color: "bg-emerald-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set the source, the transfer and both returns, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lump">Source lump sum</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="lump" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.sourceLumpSum} onChange={(e) => set("sourceLumpSum", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="transfer">Monthly transfer</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="transfer" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyTransfer} onChange={(e) => set("monthlyTransfer", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="srcRate">Source % / yr</Label>
                <Input id="srcRate" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.sourceRatePct} onChange={(e) => set("sourceRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tgtRate">Target % / yr</Label>
                <Input id="tgtRate" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.targetRatePct} onChange={(e) => set("targetRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalValue) : "—"}
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
          {result?.transfersStoppedMonth != null && (
            <p className="mt-3 rounded-lg bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-700">
              The source fund ran dry in month {result.transfersStoppedMonth}, so later transfers were smaller or skipped.
            </p>
          )}
        </div>
      </form>

      {/* Transfer chart */}
      {result && result.schedule.length > 1 && <TransferChart result={result} />}
    </div>
  );
}

function TransferChart({ result }: { result: StpResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.total)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const totalPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.total).toFixed(1)}`);
  const targetPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.target).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${targetPts.join(" L")} L${x(years)},${y(0)} Z`;
  const totalLine = `M${totalPts.join(" L")}`;
  const targetLine = `M${targetPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Transfer in motion</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Total</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Target fund</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="STP transfer chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="stpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#stpFill)" />
        <path d={targetLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={totalLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
