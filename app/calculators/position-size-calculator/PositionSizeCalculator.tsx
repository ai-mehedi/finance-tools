"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computePositionSize,
  buildStopCurve,
  formatUSD,
  type PositionSizeResult,
} from "@/lib/calculators/position-size";

type FormState = {
  accountBalance: string;
  riskPercent: string;
  stopLossPips: string;
  pipValuePerLot: string;
};

const DEFAULTS: FormState = {
  accountBalance: "10000",
  riskPercent: "1",
  stopLossPips: "20",
  pipValuePerLot: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PositionSizeResult | null {
  return computePositionSize({
    accountBalance: num(f.accountBalance),
    riskPercent: num(f.riskPercent),
    stopLossPips: num(f.stopLossPips),
    pipValuePerLot: num(f.pipValuePerLot),
  });
}

const fmtLots = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");
const fmtUnits = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function PositionSizeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PositionSizeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("All fields must be greater than 0 (account, risk percent, stop in pips, pip value).");
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

  const stopPips = num(form.stopLossPips);
  const pipVal = num(form.pipValuePerLot);

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trade setup</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set your risk and stop, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="account">Account balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="account" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.accountBalance} onChange={(e) => set("accountBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="risk">Risk per trade (%)</Label>
                <Input id="risk" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.riskPercent} onChange={(e) => set("riskPercent", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="stop">Stop loss (pips)</Label>
                <Input id="stop" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stopLossPips} onChange={(e) => set("stopLossPips", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pip">Pip value / lot ($)</Label>
                <Input id="pip" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.pipValuePerLot} onChange={(e) => set("pipValuePerLot", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Position size</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${fmtLots(result.lots)} lots` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Amount at risk
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.riskAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Units (base currency)</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{fmtUnits.format(Math.round(result.units))}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Mini lots</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{fmtLots(result.miniLots)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Micro lots</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{fmtLots(result.microLots)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Loss per standard lot</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.riskPerLot)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Stop vs size chart */}
      {result && Number.isFinite(stopPips) && Number.isFinite(pipVal) && (
        <StopCurveChart riskAmount={result.riskAmount} pipValuePerLot={pipVal} stopPips={stopPips} lots={result.lots} />
      )}
    </div>
  );
}

function StopCurveChart({
  riskAmount,
  pipValuePerLot,
  stopPips,
  lots,
}: {
  riskAmount: number;
  pipValuePerLot: number;
  stopPips: number;
  lots: number;
}) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = buildStopCurve(riskAmount, pipValuePerLot, stopPips);
  if (data.length < 2) return null;

  const maxPips = data[data.length - 1].pips || 1;
  const maxLots = Math.max(...data.map((p) => p.lots)) || 1;

  const x = (pips: number) => pad.l + (pips / maxPips) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxLots) * innerH;

  const linePts = data.map((p) => `${x(p.pips).toFixed(1)},${y(p.lots).toFixed(1)}`);
  const areaPath = `M${x(data[0].pips)},${y(0)} L${linePts.join(" L")} L${x(maxPips)},${y(0)} Z`;
  const line = `M${linePts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxLots / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [
    Math.round(maxPips / 4),
    Math.round(maxPips / 2),
    Math.round((3 * maxPips) / 4),
    Math.round(maxPips),
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Marker for the current stop.
  const curLots = riskAmount / (stopPips * pipValuePerLot);
  const showMarker = stopPips <= maxPips;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Lots vs stop-loss distance</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Lots at fixed risk</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Position size versus stop loss chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{g.v.toFixed(1)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="psFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#psFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {showMarker && (
          <>
            <line x1={x(stopPips)} y1={pad.t} x2={x(stopPips)} y2={pad.t + innerH} stroke="#fb923c" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={x(stopPips)} cy={y(curLots)} r={4} fill="#f97316" />
          </>
        )}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} pips</text>
        ))}
      </svg>
      <p className="mt-2 text-xs text-zinc-500">
        Tighter stops allow more lots for the same {formatUSD(riskAmount)} of risk; wider stops require fewer. Your {lots.toFixed(2)}-lot point is marked.
      </p>
    </div>
  );
}
