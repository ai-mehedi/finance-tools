"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCryptoPortfolio,
  formatUSD,
  type Holding,
  type CryptoPortfolioResult,
} from "@/lib/calculators/crypto-portfolio";

type Row = {
  symbol: string;
  quantity: string;
  buyPrice: string;
  currentPrice: string;
};

const DEFAULTS: Row[] = [
  { symbol: "BTC", quantity: "0.5", buyPrice: "28000", currentPrice: "42000" },
  { symbol: "ETH", quantity: "4", buyPrice: "1600", currentPrice: "2300" },
  { symbol: "SOL", quantity: "50", buyPrice: "95", currentPrice: "140" },
];

const SEGMENT_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#fbbf24", "#f59e0b", "#facc15", "#fde68a"];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function toHoldings(rows: Row[]): Holding[] {
  return rows.map((r) => ({
    symbol: r.symbol.trim().toUpperCase(),
    quantity: num(r.quantity),
    buyPrice: num(r.buyPrice),
    currentPrice: num(r.currentPrice),
  }));
}

function compute(rows: Row[]): CryptoPortfolioResult | null {
  return computeCryptoPortfolio(toHoldings(rows));
}

export default function CryptoPortfolioCalculator() {
  const [rows, setRows] = useState<Row[]>(DEFAULTS);
  const [result, setResult] = useState<CryptoPortfolioResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setRow(idx: number, k: keyof Row, v: string) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, [k]: v } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { symbol: "", quantity: "", buyPrice: "", currentPrice: "" }]);
  }

  function removeRow(idx: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((_, i) => i !== idx) : rs));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(rows);
    if (!r) {
      setError("Add at least one holding with a positive quantity and valid prices.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setRows(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-zinc-900">Your holdings</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Add each coin, then press Calculate.</p>

          <div className="mt-5 space-y-3">
            <div className="hidden gap-3 px-1 sm:grid sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
              <Label className="mb-0">Coin</Label>
              <Label className="mb-0">Quantity</Label>
              <Label className="mb-0">Avg buy price</Label>
              <Label className="mb-0">Current price</Label>
              <span className="w-9" />
            </div>

            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                <Input aria-label="Coin symbol" placeholder="BTC" className="h-11 uppercase" value={r.symbol} onChange={(e) => setRow(i, "symbol", e.target.value)} />
                <Input aria-label="Quantity" type="number" min={0} step="any" inputMode="decimal" placeholder="0" className="h-11" value={r.quantity} onChange={(e) => setRow(i, "quantity", e.target.value)} />
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input aria-label="Average buy price" type="number" min={0} step="any" inputMode="decimal" placeholder="0" className="h-11 pl-7" value={r.buyPrice} onChange={(e) => setRow(i, "buyPrice", e.target.value)} />
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input aria-label="Current price" type="number" min={0} step="any" inputMode="decimal" placeholder="0" className="h-11 pl-7" value={r.currentPrice} onChange={(e) => setRow(i, "currentPrice", e.target.value)} />
                </div>
                <button type="button" onClick={() => removeRow(i)} aria-label="Remove holding" className="flex h-11 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-rose-200 hover:text-rose-500">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-orange-300 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50">
              <Plus className="size-4" /> Add coin
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
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Portfolio value</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
              {result ? formatUSD(result.totalValue) : "—"}
            </p>
            {result && (
              <p className={`mt-1 text-sm font-semibold ${result.totalProfit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {result.totalProfit >= 0 ? "+" : ""}{formatUSD(result.totalProfit)} ({result.totalRoiPct >= 0 ? "+" : ""}{result.totalRoiPct.toFixed(1)}%)
              </p>
            )}
            <div className="mt-5 space-y-2">
              {result ? (
                <>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Total cost</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCost)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Unrealized P/L</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalProfit)}</span>
                  </div>
                </>
              ) : (
                <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid holdings to see results.</p>
              )}
            </div>
          </div>

          {result && <AllocationChart result={result} />}
        </div>
      </form>
    </div>
  );
}

function AllocationChart({ result }: { result: CryptoPortfolioResult }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const stroke = 28;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = result.holdings
    .filter((h) => h.value > 0)
    .map((h, i) => {
      const frac = h.allocationPct / 100;
      const seg = {
        symbol: h.symbol,
        pct: h.allocationPct,
        value: h.value,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        dash: frac * circumference,
        offset: -offset * circumference,
      };
      offset += frac;
      return seg;
    });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-3">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Allocation by value</h3>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label="Portfolio allocation donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {segments.map((s) => (
            <circle
              key={s.symbol}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash.toFixed(2)} ${(circumference - s.dash).toFixed(2)}`}
              strokeDashoffset={s.offset.toFixed(2)}
            />
          ))}
        </svg>
        <ul className="w-full space-y-1.5">
          {segments.map((s) => (
            <li key={s.symbol} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-zinc-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.symbol}
              </span>
              <span className="tabular-nums text-zinc-500">
                {s.pct.toFixed(1)}% · <span className="font-semibold text-zinc-900">{formatUSD(s.value)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
