"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeStockAverage,
  formatUSD,
  formatUSD2,
  formatCompact,
  type StockAverageResult,
} from "@/lib/calculators/stock-average";

type LotState = { shares: string; price: string };

const DEFAULTS: LotState[] = [
  { shares: "100", price: "50" },
  { shares: "150", price: "40" },
  { shares: "200", price: "30" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(lots: LotState[]): StockAverageResult | null {
  return computeStockAverage({
    lots: lots.map((l) => ({ shares: num(l.shares), price: num(l.price) })),
  });
}

export default function StockAverageCalculator() {
  const [lots, setLots] = useState<LotState[]>(DEFAULTS);
  const [result, setResult] = useState<StockAverageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setLot(i: number, k: keyof LotState, v: string) {
    setLots((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  }

  function addLot() {
    setLots((ls) => [...ls, { shares: "", price: "" }]);
  }

  function removeLot(i: number) {
    setLots((ls) => (ls.length <= 1 ? ls : ls.filter((_, idx) => idx !== i)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(lots);
    if (!r) {
      setError("Add at least one lot with a positive share count and a price of zero or more.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setLots(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  const breakdown = result
    ? [
        { label: "Total shares", value: result.totalShares, isShares: true },
        { label: "Total invested", value: result.totalCost, isShares: false },
        { label: "Average cost / share", value: result.averagePrice, isShares: false, cents: true },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your buy lots</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter each purchase, then press Calculate.</p>

          <div className="mt-5 space-y-3">
            {lots.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <div>
                  {i === 0 && <Label htmlFor={`shares-${i}`}>Shares</Label>}
                  <Input
                    id={`shares-${i}`}
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11"
                    placeholder="Shares"
                    value={l.shares}
                    onChange={(e) => setLot(i, "shares", e.target.value)}
                  />
                </div>
                <div>
                  {i === 0 && <Label htmlFor={`price-${i}`}>Price / share</Label>}
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input
                      id={`price-${i}`}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      className="h-11 pl-7"
                      placeholder="Price"
                      value={l.price}
                      onChange={(e) => setLot(i, "price", e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 px-3 text-zinc-400 hover:text-rose-500"
                  onClick={() => removeLot(i)}
                  aria-label="Remove lot"
                  disabled={lots.length <= 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <button
              type="button"
              onClick={addLot}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-orange-300 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
            >
              <Plus className="size-4" /> Add another lot
            </button>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Average cost per share</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.averagePrice) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {b.isShares
                      ? b.value.toLocaleString("en-US", { maximumFractionDigits: 2 })
                      : b.cents
                      ? formatUSD2(b.value)
                      : formatUSD(b.value)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid lots to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Average chart */}
      {result && result.schedule.length > 1 && <AverageChart result={result} />}
    </div>
  );
}

function AverageChart({ result }: { result: StockAverageResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const maxVal = Math.max(...data.map((p) => p.averagePrice)) * 1.15 || 1;

  const bandW = innerW / n;
  const barW = Math.min(48, bandW * 0.6);

  const x = (i: number) => pad.l + bandW * i + (bandW - barW) / 2;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  const linePts = data.map((p, i) => `${(x(i) + barW / 2).toFixed(1)},${y(p.averagePrice).toFixed(1)}`);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Running average after each lot</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Avg cost</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Average cost per lot chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {data.map((p, i) => (
          <rect
            key={i}
            x={x(i)}
            y={y(p.averagePrice)}
            width={barW}
            height={pad.t + innerH - y(p.averagePrice)}
            rx={4}
            fill="url(#avgFill)"
          />
        ))}
        <path d={`M${linePts.join(" L")}`} fill="none" stroke="#f97316" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p, i) => (
          <text key={i} x={x(i) + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            Lot {p.lot}
          </text>
        ))}
      </svg>
    </div>
  );
}
