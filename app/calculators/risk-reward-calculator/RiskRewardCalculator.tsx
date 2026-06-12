"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRiskReward,
  formatUSD,
  formatCompact,
  type RiskRewardResult,
} from "@/lib/calculators/risk-reward";

type FormState = {
  entry: string;
  stop: string;
  target: string;
  accountSize: string;
  riskPercent: string;
};

const DEFAULTS: FormState = {
  entry: "100",
  stop: "95",
  target: "115",
  accountSize: "25000",
  riskPercent: "1",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RiskRewardResult | null {
  return computeRiskReward({
    entry: num(f.entry),
    stop: num(f.stop),
    target: num(f.target),
    accountSize: num(f.accountSize) || 0,
    riskPercent: num(f.riskPercent) || 0,
  });
}

export default function RiskRewardCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RiskRewardResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter positive prices where the stop and target sit on opposite sides of the entry.");
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
        { label: "Risk per share", value: result.riskPerShare, color: "bg-rose-400" },
        { label: "Reward per share", value: result.rewardPerShare, color: "bg-orange-400" },
        { label: "Max loss at stop", value: result.maxLoss, color: "bg-rose-300" },
        { label: "Max gain at target", value: result.maxGain, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trade setup</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your prices, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="entry">Entry price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="entry" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.entry} onChange={(e) => set("entry", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="stop">Stop loss</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="stop" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.stop} onChange={(e) => set("stop", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="target">Take profit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="target" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.target} onChange={(e) => set("target", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="account">Account size</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="account" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.accountSize} onChange={(e) => set("accountSize", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="riskpct">Risk per trade (%)</Label>
                <Input id="riskpct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.riskPercent} onChange={(e) => set("riskPercent", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Risk / reward ratio</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `1 : ${result.riskRewardRatio.toFixed(2)}` : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              {result.direction === "long" ? "Long" : "Short"} trade · break-even win rate {result.breakevenWinRate.toFixed(1)}% · {result.shares.toLocaleString("en-US")} shares
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

      {/* Expectancy chart */}
      {result && result.scenarios.length > 1 && <ExpectancyChart result={result} />}
    </div>
  );
}

function ExpectancyChart({ result }: { result: RiskRewardResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.scenarios;
  const maxAbs = Math.max(...data.map((p) => Math.abs(p.expectancy))) || 1;

  // Zero line in the middle so positive bars go up, negative go down.
  const zeroY = pad.t + innerH / 2;
  const halfH = innerH / 2;
  const barW = (innerW / data.length) * 0.62;
  const slot = innerW / data.length;

  const yTicks = [maxAbs, maxAbs / 2, 0, -maxAbs / 2, -maxAbs].map((v) => ({
    v,
    yy: zeroY - (v / maxAbs) * halfH,
  }));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Expected profit per trade by win rate</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Profit</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-rose-300" /> Loss</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Trade expectancy by win rate chart">
        {yTicks.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1} />
        {data.map((p, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const h = (Math.abs(p.expectancy) / maxAbs) * halfH;
          const up = p.expectancy >= 0;
          const ry = up ? zeroY - h : zeroY;
          return (
            <g key={p.winRate}>
              <rect
                x={cx - barW / 2}
                y={ry}
                width={barW}
                height={Math.max(1, h)}
                rx={2}
                fill={up ? "#f97316" : "#fda4af"}
              />
              <text x={cx} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.winRate}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
