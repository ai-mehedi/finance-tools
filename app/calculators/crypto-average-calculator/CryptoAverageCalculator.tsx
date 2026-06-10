"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCryptoAverage,
  formatUSD,
  formatPrice,
  formatCompact,
  type CryptoAverageResult,
} from "@/lib/calculators/crypto-average";

type BuyRow = { price: string; amount: string };

type FormState = {
  buys: BuyRow[];
  currentPrice: string;
};

const DEFAULTS: FormState = {
  buys: [
    { price: "30000", amount: "0.1" },
    { price: "25000", amount: "0.15" },
    { price: "40000", amount: "0.05" },
  ],
  currentPrice: "45000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CryptoAverageResult | null {
  const buys = f.buys
    .map((b) => ({ price: num(b.price), amount: num(b.amount) }))
    .filter((b) => Number.isFinite(b.amount) && b.amount > 0 && Number.isFinite(b.price));
  if (buys.length === 0) return null;
  return computeCryptoAverage({ buys, currentPrice: num(f.currentPrice) });
}

export default function CryptoAverageCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CryptoAverageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setBuy(i: number, k: keyof BuyRow, v: string) {
    setForm((f) => {
      const buys = f.buys.map((b, idx) => (idx === i ? { ...b, [k]: v } : b));
      return { ...f, buys };
    });
  }

  function addRow() {
    setForm((f) => ({ ...f, buys: [...f.buys, { price: "", amount: "" }] }));
  }

  function removeRow(i: number) {
    setForm((f) => ({
      ...f,
      buys: f.buys.length > 1 ? f.buys.filter((_, idx) => idx !== i) : f.buys,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Add at least one buy with a quantity greater than 0 and a valid price.");
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

  const pl = result?.profitLoss ?? 0;
  const plPositive = pl >= 0;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your buys</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Add each purchase, then press Calculate.</p>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 px-1 text-xs font-semibold text-zinc-400">
              <span>Buy price</span>
              <span>Quantity</span>
              <span className="w-8" />
            </div>
            {form.buys.map((b, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input aria-label={`Buy ${i + 1} price`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={b.price} onChange={(e) => setBuy(i, "price", e.target.value)} />
                </div>
                <Input aria-label={`Buy ${i + 1} quantity`} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={b.amount} onChange={(e) => setBuy(i, "amount", e.target.value)} />
                <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => removeRow(i)} aria-label={`Remove buy ${i + 1}`}>
                  <Trash2 />
                </Button>
              </div>
            ))}

            <Button type="button" variant="ghost" size="sm" onClick={addRow} className="text-orange-600 hover:bg-orange-50">
              <Plus /> Add another buy
            </Button>

            <div className="border-t border-zinc-100 pt-4">
              <Label htmlFor="current">Current price (optional)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="current" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentPrice} onChange={(e) => setForm((f) => ({ ...f, currentPrice: e.target.value }))} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Average buy price</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPrice(result.averagePrice) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total coins</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.totalCoins.toLocaleString("en-US", { maximumFractionDigits: 8 })}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total invested</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInvested)}</span>
                </div>
                {result.hasCurrentPrice && (
                  <>
                    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                      <span className="text-sm font-medium text-zinc-500">Current value</span>
                      <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.currentValue)}</span>
                    </div>
                    <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${plPositive ? "bg-emerald-50" : "bg-rose-50"}`}>
                      <span className={`text-sm font-medium ${plPositive ? "text-emerald-600" : "text-rose-600"}`}>Profit / loss</span>
                      <span className={`text-sm font-bold tabular-nums ${plPositive ? "text-emerald-700" : "text-rose-700"}`}>
                        {plPositive ? "+" : ""}{formatUSD(result.profitLoss)} ({plPositive ? "+" : ""}{result.profitLossPct.toFixed(1)}%)
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid buys to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Running average chart */}
      {result && result.schedule.length > 1 && <AverageChart result={result} />}
    </div>
  );
}

function AverageChart({ result }: { result: CryptoAverageResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 56, r: 16, t: 16, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const maxVal = Math.max(...data.map((p) => p.avgPrice)) * 1.1 || 1;

  const x = (i: number) => pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const avgPts = data.map((p, i) => `${x(i).toFixed(1)},${y(p.avgPrice).toFixed(1)}`);
  const avgLine = `M${avgPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Average price after each buy</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Avg price</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Running average price chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <path d={avgLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.avgPrice)} r={3.5} fill="#fb923c" stroke="#fff" strokeWidth={1.5} />
        ))}
        {data.map((p, i) => (
          <text key={`t${i}`} x={x(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>#{p.index}</text>
        ))}
      </svg>
    </div>
  );
}
