"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeOptionsProfit,
  formatUSD,
  formatCompact,
  type OptionType,
  type Side,
  type OptionsProfitResult,
} from "@/lib/calculators/options-profit";

type FormState = {
  optionType: OptionType;
  side: Side;
  strike: string;
  premium: string;
  contracts: string;
  contractSize: string;
  spotAtExpiry: string;
};

const DEFAULTS: FormState = {
  optionType: "call",
  side: "long",
  strike: "100",
  premium: "3.5",
  contracts: "1",
  contractSize: "100",
  spotAtExpiry: "115",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): OptionsProfitResult | null {
  return computeOptionsProfit({
    optionType: f.optionType,
    side: f.side,
    strike: num(f.strike),
    premium: num(f.premium),
    contracts: num(f.contracts),
    contractSize: num(f.contractSize) || 100,
    spotAtExpiry: num(f.spotAtExpiry),
  });
}

export default function OptionsProfitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<OptionsProfitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive strike, premium, contract count and underlying price.");
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

  const positive = result ? result.profitAtSpot >= 0 : false;

  const breakdown = result
    ? [
        { label: "Position size", value: `${result.shares.toLocaleString("en-US")} shares` },
        {
          label: form.side === "long" ? "Premium paid" : "Premium received",
          value: formatUSD(result.costBasis),
        },
        { label: "Breakeven price", value: formatUSD(result.breakeven) },
        {
          label: "Max profit",
          value: result.maxProfit === null ? "Unlimited" : formatUSD(result.maxProfit),
        },
        {
          label: "Max loss",
          value: result.maxLoss === null ? "Unlimited" : formatUSD(result.maxLoss),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your option</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Describe the contract, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type">Option type</Label>
                <Select id="type" className="h-11" value={form.optionType} onChange={(e) => set("optionType", e.target.value as OptionType)}>
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="side">Position</Label>
                <Select id="side" className="h-11" value={form.side} onChange={(e) => set("side", e.target.value as Side)}>
                  <option value="long">Long (buy)</option>
                  <option value="short">Short (sell)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="strike">Strike price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="strike" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.strike} onChange={(e) => set("strike", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="premium">Premium / share</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="premium" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.premium} onChange={(e) => set("premium", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="contracts">Contracts</Label>
                <Input id="contracts" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.contracts} onChange={(e) => set("contracts", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="size">Shares / contract</Label>
                <Input id="size" type="number" min={1} step="any" inputMode="decimal" className="h-11" value={form.contractSize} onChange={(e) => set("contractSize", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="spot">Price at expiry</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="spot" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.spotAtExpiry} onChange={(e) => set("spotAtExpiry", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            Profit / loss at expiry
          </p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${positive ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? formatUSD(result.profitAtSpot) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Payoff chart */}
      {result && result.schedule.length > 1 && (
        <PayoffChart result={result} strike={num(form.strike)} spot={num(form.spotAtExpiry)} />
      )}
    </div>
  );
}

function PayoffChart({
  result,
  strike,
  spot,
}: {
  result: OptionsProfitResult;
  strike: number;
  spot: number;
}) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const minP = data[0].price;
  const maxP = data[data.length - 1].price;
  const profits = data.map((p) => p.profit);
  const minProfit = Math.min(...profits, 0);
  const maxProfit = Math.max(...profits, 0);
  const range = maxProfit - minProfit || 1;

  const x = (price: number) => pad.l + ((price - minP) / (maxP - minP || 1)) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minProfit) / range) * innerH;

  const linePts = data.map((p) => `${x(p.price).toFixed(1)},${y(p.profit).toFixed(1)}`);
  const line = `M${linePts.join(" L")}`;
  const zeroY = y(0);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minProfit + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [minP, (minP + maxP) / 2, maxP];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Profit at each underlying price</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> P/L</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-zinc-400" /> Strike</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Options profit and loss chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {/* zero line */}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1.25} strokeDasharray="3 3" />
        {/* strike marker */}
        {Number.isFinite(strike) && strike >= minP && strike <= maxP && (
          <line x1={x(strike)} y1={pad.t} x2={x(strike)} y2={pad.t + innerH} stroke="#a1a1aa" strokeWidth={1.25} />
        )}
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* spot marker */}
        {Number.isFinite(spot) && spot >= minP && spot <= maxP && (
          <circle cx={x(spot)} cy={y(result.profitAtSpot)} r={4} fill="#fb923c" stroke="#fff" strokeWidth={1.5} />
        )}
        {xTicks.map((t, i) => (
          <text key={i} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{formatCompact(t)}</text>
        ))}
      </svg>
    </div>
  );
}
