"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCryptoProfit,
  formatUSD,
  formatCompact,
  type CryptoProfitResult,
} from "@/lib/calculators/crypto-profit";

type FormState = {
  investment: string;
  buyPrice: string;
  sellPrice: string;
  buyFeePct: string;
  sellFeePct: string;
};

const DEFAULTS: FormState = {
  investment: "1000",
  buyPrice: "25000",
  sellPrice: "40000",
  buyFeePct: "0.1",
  sellFeePct: "0.1",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CryptoProfitResult | null {
  return computeCryptoProfit({
    investment: num(f.investment),
    buyPrice: num(f.buyPrice),
    sellPrice: num(f.sellPrice),
    buyFeePct: num(f.buyFeePct) || 0,
    sellFeePct: num(f.sellFeePct) || 0,
  });
}

export default function CryptoProfitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CryptoProfitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive investment, buy price and sell price.");
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

  const profitable = result ? result.profit >= 0 : true;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your trade</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the trade details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="investment">Amount invested</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="investment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.investment} onChange={(e) => set("investment", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buyPrice">Buy price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="buyPrice" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.buyPrice} onChange={(e) => set("buyPrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="sellPrice">Sell price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="sellPrice" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.sellPrice} onChange={(e) => set("sellPrice", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buyFee">Buy fee (%)</Label>
                <Input id="buyFee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.buyFeePct} onChange={(e) => set("buyFeePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sellFee">Sell fee (%)</Label>
                <Input id="sellFee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.sellFeePct} onChange={(e) => set("sellFeePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{profitable ? "Profit" : "Loss"}</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${profitable ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? `${result.profit >= 0 ? "+" : ""}${formatUSD(result.profit)}` : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              ROI {result.roiPct >= 0 ? "+" : ""}{result.roiPct.toFixed(1)}%
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Coins bought</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.coins.toLocaleString("en-US", { maximumFractionDigits: 6 })}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Net proceeds</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netProceeds)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total fees</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalFees)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Break-even price</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.breakEvenPrice)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <ProfitChart result={result} investment={num(form.investment) || 0} />}
    </div>
  );
}

function ProfitChart({ result, investment }: { result: CryptoProfitResult; investment: number }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const bars = [
    { label: "Invested", value: investment, color: "#a1a1aa" },
    { label: "Gross", value: result.grossProceeds, color: "#fdba74" },
    { label: "Net", value: result.netProceeds, color: "#fb923c" },
    { label: "Profit", value: Math.max(result.profit, 0), color: "#f97316" },
  ];

  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: pad.t + innerH - (v / maxVal) * innerH };
  });

  const slot = innerW / bars.length;
  const barW = slot * 0.5;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your money goes</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Crypto profit breakdown bar chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const h = (b.value / maxVal) * innerH;
          const bx = pad.l + slot * i + (slot - barW) / 2;
          const by = pad.t + innerH - h;
          return (
            <g key={b.label}>
              <rect x={bx} y={by} width={barW} height={Math.max(h, 0)} rx={4} fill={b.color} />
              <text x={bx + barW / 2} y={H - 18} textAnchor="middle" className="fill-zinc-500" fontSize={11}>{b.label}</text>
              <text x={bx + barW / 2} y={by - 5} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{formatCompact(b.value)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
