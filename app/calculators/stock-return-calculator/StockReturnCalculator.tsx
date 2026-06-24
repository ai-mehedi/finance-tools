"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeStockReturn,
  formatUSD,
  formatCompact,
  type StockReturnResult,
} from "@/lib/calculators/stock-return";

type FormState = {
  shares: string;
  buyPrice: string;
  sellPrice: string;
  dividendPerShare: string;
  years: string;
};

const DEFAULTS: FormState = {
  shares: "100",
  buyPrice: "40",
  sellPrice: "75",
  dividendPerShare: "4",
  years: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): StockReturnResult | null {
  return computeStockReturn({
    shares: num(f.shares),
    buyPrice: num(f.buyPrice),
    sellPrice: num(f.sellPrice),
    dividendPerShare: num(f.dividendPerShare) || 0,
    years: num(f.years),
  });
}

export default function StockReturnCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter positive shares, a buy price above zero, and a holding period above zero."
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

  const isGain = result ? result.totalReturn >= 0 : true;

  const breakdown = result
    ? [
        { label: "Price appreciation", value: formatUSD(result.priceGain), color: "bg-orange-300" },
        { label: "Dividend income", value: formatUSD(result.dividendIncome), color: "bg-orange-500" },
        { label: "Total return", value: `${result.totalReturnPct.toFixed(2)}%`, color: "bg-zinc-300" },
        { label: "Annualized (CAGR)", value: `${result.annualizedPct.toFixed(2)}%`, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your holding</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="shares">Number of shares</Label>
                <Input id="shares" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.shares} onChange={(e) => set("shares", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Holding period (yrs)</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
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

            <div>
              <Label htmlFor="div">Total dividends / share (over period)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="div" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.dividendPerShare} onChange={(e) => set("dividendPerShare", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total return</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${isGain ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? formatUSD(result.totalReturn) : "—"}
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

      {/* Growth chart */}
      {result && result.schedule.length > 1 && <ReturnChart result={result} />}

      {/* What-if: how different sell prices change total return + CAGR. */}
      {result && <SellPriceScenarios form={form} />}
    </div>
  );
}

/** Sweeps the sell price so the user sees total return and annualized CAGR at a
 *  spread of exit prices around their own value. */
function SellPriceScenarios({ form }: { form: FormState }) {
  const base = num(form.sellPrice);

  const { rows, highlightIndex } = useMemo(() => {
    const buy = num(form.buyPrice) || 0;
    const candidates = [
      buy,
      buy * 1.25,
      buy * 1.5,
      buy * 2,
      buy * 3,
      Number.isFinite(base) ? base : buy,
    ];

    const prices = Array.from(new Set(candidates.map((p) => Math.round(p * 100) / 100)))
      .filter((p) => p >= 0)
      .sort((a, b) => a - b);

    const built = prices.map((price) => {
      const r = compute({ ...form, sellPrice: String(price) });
      return {
        sellPrice: price,
        totalReturn: r?.totalReturn ?? 0,
        totalReturnPct: r ? `${r.totalReturnPct.toFixed(2)}%` : "—",
        annualizedPct: r ? `${r.annualizedPct.toFixed(2)}%` : "—",
      };
    });

    const target = Math.round((Number.isFinite(base) ? base : -1) * 100) / 100;
    return { rows: built, highlightIndex: built.findIndex((r) => r.sellPrice === target) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "sellPrice", label: "Sell price / share", format: (v) => formatUSD(Number(v)) },
    { key: "totalReturn", label: "Total return", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "totalReturnPct", label: "Total return %", align: "right" },
    { key: "annualizedPct", label: "Annualized (CAGR)", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you sold at a different price?"
      caption="Same holding — only the exit price per share changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="stock-return-sell-price-scenarios"
    />
  );
}

function ReturnChart({ result }: { result: StockReturnResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.value)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const valPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${valPts.join(" L")} L${x(years)},${y(0)} Z`;
  const valLine = `M${valPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), Math.round(years)].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Value over the holding period</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Position value</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Stock value over time chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="srFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#srFill)" />
        <path d={valLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
