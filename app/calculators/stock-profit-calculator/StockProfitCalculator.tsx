"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeStockProfit,
  formatUSD,
  formatUSD2,
  formatCompact,
  type StockProfitResult,
} from "@/lib/calculators/stock-profit";

type FormState = {
  shares: string;
  buyPrice: string;
  sellPrice: string;
  buyCommission: string;
  sellCommission: string;
};

const DEFAULTS: FormState = {
  shares: "100",
  buyPrice: "45",
  sellPrice: "62",
  buyCommission: "5",
  sellCommission: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): StockProfitResult | null {
  return computeStockProfit({
    shares: num(f.shares),
    buyPrice: num(f.buyPrice),
    sellPrice: num(f.sellPrice),
    buyCommission: num(f.buyCommission) || 0,
    sellCommission: num(f.sellCommission) || 0,
  });
}

export default function StockProfitCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null
    ? "Enter a positive share count with non-negative prices and commissions."
    : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const isProfit = result ? result.netProfit >= 0 : true;

  const breakdown = result
    ? [
        { label: "Total cost (incl. fees)", value: formatUSD(result.totalCost) },
        { label: "Total proceeds (net of fees)", value: formatUSD(result.totalProceeds) },
        { label: "Total commissions", value: formatUSD2(result.totalCommission) },
        { label: "Break-even sell price", value: formatUSD2(result.breakeven) },
        { label: "Return on cost", value: `${result.returnPct.toFixed(2)}%` },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trade details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="shares">Number of shares</Label>
              <Input id="shares" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.shares} onChange={(e) => set("shares", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buy">Buy price / share</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="buy" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.buyPrice} onChange={(e) => set("buyPrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="sell">Sell price / share</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="sell" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.sellPrice} onChange={(e) => set("sellPrice", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buyfee">Buy commission</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="buyfee" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.buyCommission} onChange={(e) => set("buyCommission", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="sellfee">Sell commission</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="sellfee" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.sellCommission} onChange={(e) => set("sellCommission", e.target.value)} />
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{isProfit ? "Net profit" : "Net loss"}</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${isProfit ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? formatUSD(result.netProfit) : "—"}
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

      {/* Cost vs proceeds chart */}
      {result && <ProfitChart result={result} />}

      {/* What-if: how different sell prices change net profit and return. */}
      {result && <SellPriceScenarios form={form} />}
    </div>
  );
}

/** Sweeps the sell price so the user sees how net profit and return on cost
 *  move at a spread of exit prices, plus their own value highlighted. */
function SellPriceScenarios({ form }: { form: FormState }) {
  const base = num(form.sellPrice);

  const { rows, highlightIndex } = useMemo(() => {
    const buy = num(form.buyPrice) || 0;
    // Spread of plausible exit prices anchored to the buy price plus the user's own.
    const candidates = [
      buy * 0.75,
      buy,
      buy * 1.1,
      buy * 1.25,
      buy * 1.5,
      Number.isFinite(base) ? base : buy,
    ];
    const prices = Array.from(new Set(candidates.map((p) => Math.max(0, Math.round(p * 100) / 100))))
      .sort((a, b) => a - b);

    const built = prices.map((sellPrice) => {
      const r = compute({ ...form, sellPrice: String(sellPrice) });
      return {
        sellPrice,
        netProfit: r?.netProfit ?? 0,
        returnPct: r ? `${r.returnPct.toFixed(2)}%` : "—",
      };
    });

    return {
      rows: built,
      highlightIndex: built.findIndex((r) => r.sellPrice === (Number.isFinite(base) ? Math.round(base * 100) / 100 : -1)),
    };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "sellPrice", label: "Sell price / share", format: (v) => formatUSD2(Number(v)) },
    { key: "netProfit", label: "Net profit", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "returnPct", label: "Return on cost", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you sold at a different price?"
      caption="Same shares and fees — only the sell price per share changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="stock-profit-sell-price-scenarios"
    />
  );
}

function ProfitChart({ result }: { result: StockProfitResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const bars = [
    { label: "Cost", value: result.totalCost, color: "#a1a1aa" },
    { label: "Proceeds", value: result.totalProceeds, color: "#fb923c" },
  ];
  const maxVal = Math.max(...bars.map((b) => b.value), 1) * 1.15;

  const bandW = innerW / bars.length;
  const barW = Math.min(110, bandW * 0.5);
  const x = (i: number) => pad.l + bandW * i + (bandW - barW) / 2;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cost vs proceeds</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-zinc-400" /> Cost</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Proceeds</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cost versus proceeds chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {bars.map((b, i) => (
          <g key={b.label}>
            <rect x={x(i)} y={y(b.value)} width={barW} height={pad.t + innerH - y(b.value)} rx={5} fill={b.color} />
            <text x={x(i) + barW / 2} y={y(b.value) - 6} textAnchor="middle" className="fill-zinc-500" fontSize={11} fontWeight={700}>
              {formatCompact(b.value)}
            </text>
            <text x={x(i) + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={11}>{b.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
