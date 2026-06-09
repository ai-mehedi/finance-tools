"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeForexProfit,
  formatUSD,
  formatPips,
  type TradeDirection,
  type ForexProfitResult,
} from "@/lib/calculators/forex-profit";

type FormState = {
  direction: TradeDirection;
  lots: string;
  contractSize: string;
  entryPrice: string;
  exitPrice: string;
  pipSize: string;
};

const DEFAULTS: FormState = {
  direction: "buy",
  lots: "1",
  contractSize: "100000",
  entryPrice: "1.0850",
  exitPrice: "1.0920",
  pipSize: "0.0001",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ForexProfitResult | null {
  return computeForexProfit({
    direction: f.direction,
    lots: num(f.lots),
    contractSize: num(f.contractSize),
    entryPrice: num(f.entryPrice),
    exitPrice: num(f.exitPrice),
    pipSize: num(f.pipSize),
  });
}

export default function ForexProfitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ForexProfitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter positive values for lots, prices and pip size.");
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

  const isProfit = result ? result.profit >= 0 : true;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trade details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="direction">Direction</Label>
                <Select id="direction" className="h-11" value={form.direction} onChange={(e) => set("direction", e.target.value as TradeDirection)}>
                  <option value="buy">Buy (long)</option>
                  <option value="sell">Sell (short)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="lots">Trade size (lots)</Label>
                <Input id="lots" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.lots} onChange={(e) => set("lots", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="entry">Entry price</Label>
                <Input id="entry" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.entryPrice} onChange={(e) => set("entryPrice", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="exit">Exit price</Label>
                <Input id="exit" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.exitPrice} onChange={(e) => set("exitPrice", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contract">Contract size (units / lot)</Label>
                <Input id="contract" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.contractSize} onChange={(e) => set("contractSize", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pip">Pip size</Label>
                <Input id="pip" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.pipSize} onChange={(e) => set("pipSize", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{isProfit ? "Profit" : "Loss"}</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result ? (isProfit ? "text-emerald-600" : "text-rose-600") : "text-zinc-900"}`}>
            {result ? formatUSD(result.profit) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Pip movement</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPips(result.pips)} pips</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Profit per lot</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.returnPerLot)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Position units</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.positionUnits.toLocaleString("en-US")}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <PipBar pips={result.pips} isProfit={isProfit} />}
    </div>
  );
}

function PipBar({ pips, isProfit }: { pips: number; isProfit: boolean }) {
  const W = 640;
  const H = 90;
  const mid = W / 2;
  const maxPips = Math.max(Math.abs(pips), 1);
  // Scale so the current move uses about 80% of the half width.
  const scale = (W / 2 - 24) * 0.8;
  const len = (Math.abs(pips) / maxPips) * scale;
  const barColor = isProfit ? "#10b981" : "#f43f5e";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Pip movement from entry</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Forex pip movement bar">
        <line x1={mid} y1={16} x2={mid} y2={H - 24} stroke="#d4d4d8" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={mid} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>entry</text>
        {pips >= 0 ? (
          <rect x={mid} y={26} width={len} height={26} rx={4} fill={barColor} />
        ) : (
          <rect x={mid - len} y={26} width={len} height={26} rx={4} fill={barColor} />
        )}
        <text x={pips >= 0 ? mid + len + 6 : mid - len - 6} y={43} textAnchor={pips >= 0 ? "start" : "end"} className="fill-zinc-600" fontSize={12} fontWeight={700}>
          {pips >= 0 ? "+" : ""}{pips.toFixed(1)} pips
        </text>
      </svg>
    </div>
  );
}
