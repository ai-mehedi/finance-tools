"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCryptoRoi,
  formatUSD,
  formatCompact,
  type CryptoRoiResult,
} from "@/lib/calculators/crypto-roi";

type FormState = {
  investment: string;
  buyPrice: string;
  sellPrice: string;
  feePct: string;
  holdingDays: string;
};

const DEFAULTS: FormState = {
  investment: "5000",
  buyPrice: "20000",
  sellPrice: "32000",
  feePct: "0.5",
  holdingDays: "365",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CryptoRoiResult | null {
  return computeCryptoRoi({
    investment: num(f.investment),
    buyPrice: num(f.buyPrice),
    sellPrice: num(f.sellPrice),
    feePct: num(f.feePct) || 0,
    holdingDays: num(f.holdingDays),
  });
}

export default function CryptoRoiCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CryptoRoiResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive investment, a buy price above 0, and a non-negative sell price and fee.");
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

  const profitPositive = result ? result.profit >= 0 : true;

  const breakdown = result
    ? [
        { label: "Coins acquired", value: result.coins, money: false },
        { label: "Gross proceeds", value: result.grossProceeds, money: true },
        { label: "Total fees", value: result.totalFees, money: true },
        { label: "Net proceeds", value: result.netProceeds, money: true },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your trade</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your entry and exit, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="investment">Amount invested</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="investment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.investment} onChange={(e) => set("investment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="fee">Fee per trade (%)</Label>
                <Input id="fee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.feePct} onChange={(e) => set("feePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buy">Buy price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="buy" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.buyPrice} onChange={(e) => set("buyPrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="sell">Sell price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="sell" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.sellPrice} onChange={(e) => set("sellPrice", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="days">Holding period (days, optional)</Label>
              <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.holdingDays} onChange={(e) => set("holdingDays", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net profit / loss</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${profitPositive ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? formatUSD(result.profit) : "—"}
          </p>
          {result && (
            <p className={`mt-1 text-sm font-bold ${profitPositive ? "text-orange-600" : "text-rose-600"}`}>
              ROI {result.roiPct.toFixed(1)}%
              {result.annualizedPct !== null && ` · ${result.annualizedPct.toFixed(1)}% / yr`}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {b.money ? formatUSD(b.value) : b.value.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Scenario chart */}
      {result && result.schedule.length > 1 && <ProfitChart result={result} sellPrice={num(form.sellPrice) || 0} />}
    </div>
  );
}

function ProfitChart({ result, sellPrice }: { result: CryptoRoiResult; sellPrice: number }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxPrice = data[data.length - 1].price || 1;
  const profits = data.map((p) => p.profit);
  const maxP = Math.max(...profits, 0);
  const minP = Math.min(...profits, 0);
  const range = maxP - minP || 1;

  const x = (price: number) => pad.l + (price / maxPrice) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minP) / range) * innerH;

  const pts = data.map((p) => `${x(p.price).toFixed(1)},${y(p.profit).toFixed(1)}`);
  const zeroY = y(0);
  const areaPath = `M${x(0)},${zeroY} L${pts.join(" L")} L${x(maxPrice)},${zeroY} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minP + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Profit by exit price</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Net profit</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Your exit</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Profit by exit price chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1} />
        <defs>
          <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#roiFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {sellPrice > 0 && sellPrice <= maxPrice && (
          <line x1={x(sellPrice)} y1={pad.t} x2={x(sellPrice)} y2={pad.t + innerH} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
        )}
        {[0, maxPrice / 2, maxPrice].map((t, i) => (
          <text key={i} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{formatCompact(t)}</text>
        ))}
      </svg>
    </div>
  );
}
