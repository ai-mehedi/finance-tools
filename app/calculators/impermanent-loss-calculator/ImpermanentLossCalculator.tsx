"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeImpermanentLoss,
  formatUSD,
  type ImpermanentLossResult,
} from "@/lib/calculators/impermanent-loss";

type FormState = {
  initialPriceA: string;
  initialPriceB: string;
  futurePriceA: string;
  futurePriceB: string;
  depositUSD: string;
};

const DEFAULTS: FormState = {
  initialPriceA: "2000",
  initialPriceB: "1",
  futurePriceA: "3000",
  futurePriceB: "1",
  depositUSD: "10000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ImpermanentLossResult | null {
  return computeImpermanentLoss({
    initialPriceA: num(f.initialPriceA),
    initialPriceB: num(f.initialPriceB),
    futurePriceA: num(f.futurePriceA),
    futurePriceB: num(f.futurePriceB),
    depositUSD: num(f.depositUSD),
  });
}

const pct = (n: number) => `${n >= 0 ? "" : ""}${n.toFixed(2)}%`;

export default function ImpermanentLossCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ImpermanentLossResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter prices greater than 0 for both tokens at deposit and now, plus a deposit amount above 0.");
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
        { label: "Value if you held (HODL)", value: formatUSD(result.hodlValue), color: "bg-zinc-300" },
        { label: "Value as LP (no fees)", value: formatUSD(result.lpValue), color: "bg-orange-300" },
        { label: "Relative price move", value: pct(result.relativeChangePct), color: "bg-orange-400" },
        { label: "Loss vs holding", value: formatUSD(result.ilUSD), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Pool inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">For a 50/50 pool. Enter token prices at deposit and now.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ipA">Token A price at deposit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="ipA" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initialPriceA} onChange={(e) => set("initialPriceA", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="fpA">Token A price now</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="fpA" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.futurePriceA} onChange={(e) => set("futurePriceA", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ipB">Token B price at deposit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="ipB" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initialPriceB} onChange={(e) => set("initialPriceB", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="fpB">Token B price now</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="fpB" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.futurePriceB} onChange={(e) => set("futurePriceB", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="dep">Total deposited (split 50/50)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="dep" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.depositUSD} onChange={(e) => set("depositUSD", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Impermanent loss</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${result.ilPct.toFixed(2)}%` : "—"}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {result ? <>That's <span className="text-orange-600">{formatUSD(result.ilUSD)}</span> below just holding</> : "Enter valid values"}
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

      {/* IL curve */}
      {result && <ILChart result={result} />}
    </div>
  );
}

function ILChart({ result }: { result: ImpermanentLossResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.curve;
  const minPct = data[0].changePct;
  const maxPct = data[data.length - 1].changePct;
  // IL is between 0 and about -25% across this range.
  const minIL = Math.min(...data.map((p) => p.ilPct), -1);

  const x = (changePct: number) =>
    pad.l + ((changePct - minPct) / (maxPct - minPct)) * innerW;
  const y = (il: number) => pad.t + (il / minIL) * innerH;

  const linePts = data.map((p) => `${x(p.changePct).toFixed(1)},${y(p.ilPct).toFixed(1)}`);
  const areaPath = `M${x(minPct)},${y(0)} L${linePts.join(" L")} L${x(maxPct)},${y(0)} Z`;
  const line = `M${linePts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (minIL / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [minPct, 0, 100, maxPct].filter((v, i, a) => a.indexOf(v) === i);

  // Marker for the user's actual relative move (clamped to chart range).
  const mark = Math.max(minPct, Math.min(maxPct, result.relativeChangePct));
  const mx = x(mark);
  const my = y(result.ilPct);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Loss vs relative price move</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> IL curve</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Your position</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Impermanent loss curve">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{g.v.toFixed(0)}%</text>
          </g>
        ))}
        <defs>
          <linearGradient id="ilFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#ilFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={mx} y1={pad.t} x2={mx} y2={pad.t + innerH} stroke="#fb923c" strokeWidth={1} strokeDasharray="4 3" />
        <circle cx={mx} cy={my} r={4.5} fill="#f97316" stroke="#fff" strokeWidth={1.5} />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t > 0 ? `+${t}` : t}%</text>
        ))}
      </svg>
    </div>
  );
}
