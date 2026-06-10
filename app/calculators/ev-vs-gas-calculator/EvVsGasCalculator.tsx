"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeEvVsGas,
  formatUSD,
  formatCompact,
  type EvVsGasResult,
} from "@/lib/calculators/ev-vs-gas";

type FormState = {
  annualMiles: string;
  years: string;
  gasMpg: string;
  gasPrice: string;
  evMilesPerKwh: string;
  elecPrice: string;
  priceDifference: string;
  maintGas: string;
  maintEv: string;
};

const DEFAULTS: FormState = {
  annualMiles: "12000",
  years: "8",
  gasMpg: "28",
  gasPrice: "3.50",
  evMilesPerKwh: "3.5",
  elecPrice: "0.16",
  priceDifference: "5000",
  maintGas: "1200",
  maintEv: "600",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): EvVsGasResult | null {
  return computeEvVsGas({
    annualMiles: num(f.annualMiles),
    years: num(f.years),
    gasMpg: num(f.gasMpg),
    gasPricePerGallon: num(f.gasPrice) || 0,
    evMilesPerKwh: num(f.evMilesPerKwh),
    electricityPricePerKwh: num(f.elecPrice) || 0,
    priceDifference: num(f.priceDifference) || 0,
    annualMaintenanceGas: num(f.maintGas) || 0,
    annualMaintenanceEv: num(f.maintEv) || 0,
  });
}

export default function EvVsGasCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EvVsGasResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter positive miles, a horizon over 0 years, and non-zero MPG and miles per kWh.");
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
        { label: "Gas fuel per year", value: result.gasFuelPerYear, color: "bg-zinc-300" },
        { label: "EV energy per year", value: result.evEnergyPerYear, color: "bg-orange-300" },
        { label: "Gas total cost", value: result.gasTotalCost, color: "bg-zinc-400" },
        { label: "EV total cost", value: result.evTotalCost, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your driving</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your mileage and both vehicles, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="miles">Miles per year</Label>
                <Input id="miles" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualMiles} onChange={(e) => set("annualMiles", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years owned</Label>
                <Input id="years" type="number" min={1} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <h3 className="text-sm font-extrabold text-zinc-900">Gas vehicle</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mpg">Fuel economy (MPG)</Label>
                  <Input id="mpg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.gasMpg} onChange={(e) => set("gasMpg", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="gasPrice">Gas price ($/gal)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="gasPrice" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.gasPrice} onChange={(e) => set("gasPrice", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="maintGas">Maintenance ($/yr)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="maintGas" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.maintGas} onChange={(e) => set("maintGas", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <h3 className="text-sm font-extrabold text-zinc-900">Electric vehicle</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="effEv">Efficiency (mi/kWh)</Label>
                  <Input id="effEv" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.evMilesPerKwh} onChange={(e) => set("evMilesPerKwh", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="elec">Electricity ($/kWh)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="elec" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.elecPrice} onChange={(e) => set("elecPrice", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="maintEv">Maintenance ($/yr)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="maintEv" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.maintEv} onChange={(e) => set("maintEv", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="diff">EV price premium</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="diff" type="number" step="any" inputMode="decimal" className="h-11 pl-7" value={form.priceDifference} onChange={(e) => set("priceDifference", e.target.value)} />
                  </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total saved by going electric</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalSavings) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.breakEvenYear !== null
                ? result.breakEvenYear === 0
                  ? "The EV is cheaper from day one"
                  : `Breaks even in year ${result.breakEvenYear}`
                : "Does not break even within this horizon"}
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

      {/* Cost chart */}
      {result && result.schedule.length > 1 && <CostChart result={result} />}
    </div>
  );
}

function CostChart({ result }: { result: EvVsGasResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal =
    Math.max(...data.map((p) => Math.max(p.gasCumulative, p.evCumulative))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gasPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.gasCumulative).toFixed(1)}`);
  const evPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.evCumulative).toFixed(1)}`);
  const gasArea = `M${x(0)},${y(0)} L${gasPts.join(" L")} L${x(years)},${y(0)} Z`;
  const gasLine = `M${gasPts.join(" L")}`;
  const evLine = `M${evPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative cost over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Gas</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> EV</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="EV versus gas cumulative cost chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="evgFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={gasArea} fill="url(#evgFill)" />
        <path d={gasLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={evLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
