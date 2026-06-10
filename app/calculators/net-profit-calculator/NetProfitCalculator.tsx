"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeNetProfit,
  formatUSD,
  formatCompact,
  type NetProfitResult,
} from "@/lib/calculators/net-profit";

type FormState = {
  revenue: string;
  cogs: string;
  operatingExpenses: string;
  interest: string;
  taxRatePct: string;
};

const DEFAULTS: FormState = {
  revenue: "500000",
  cogs: "200000",
  operatingExpenses: "150000",
  interest: "20000",
  taxRatePct: "21",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): NetProfitResult | null {
  return computeNetProfit({
    revenue: num(f.revenue) || 0,
    cogs: num(f.cogs) || 0,
    operatingExpenses: num(f.operatingExpenses) || 0,
    interest: num(f.interest) || 0,
    taxRatePct: num(f.taxRatePct) || 0,
  });
}

export default function NetProfitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<NetProfitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative amounts and a tax rate between 0 and 100.");
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

  const profit = result ? result.netProfit >= 0 : false;
  const breakdown = result
    ? [
        { label: "Gross profit", value: result.grossProfit, color: "bg-orange-300", margin: result.grossMarginPct },
        { label: "Operating profit", value: result.operatingProfit, color: "bg-orange-400", margin: result.operatingMarginPct },
        { label: "Tax", value: result.taxAmount, color: "bg-zinc-300", margin: null },
        { label: "Net profit", value: result.netProfit, color: "bg-orange-500", margin: result.netMarginPct },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Income statement inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your period totals, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="revenue">Total revenue</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cogs">Cost of goods sold</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cogs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cogs} onChange={(e) => set("cogs", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="opex">Operating expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="opex" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.operatingExpenses} onChange={(e) => set("operatingExpenses", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="interest">Interest expense</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="interest" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.interest} onChange={(e) => set("interest", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="tax">Tax rate (%)</Label>
                <Input id="tax" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net profit</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netProfit) : "—"}
          </p>
          {result && (
            <p className={`mt-1 text-xs font-semibold ${profit ? "text-emerald-600" : "text-rose-500"}`}>
              {profit
                ? `Net margin of ${result.netMarginPct.toFixed(1)}% of revenue.`
                : "The business is running at a net loss this period."}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                    {b.margin !== null && <span className="text-xs text-zinc-400">({b.margin.toFixed(0)}%)</span>}
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

      {result && <WaterfallChart result={result} />}
    </div>
  );
}

function WaterfallChart({ result }: { result: NetProfitResult }) {
  const W = 640;
  const H = 280;
  const pad = { l: 56, r: 16, t: 16, b: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const stages = result.stages;
  const maxVal = Math.max(...stages.map((s) => s.amount), 0);
  const minVal = Math.min(...stages.map((s) => s.amount), 0);
  const range = maxVal - minVal || 1;

  const bw = innerW / stages.length;
  const barW = bw * 0.6;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / range) * innerH;
  const zeroY = y(0);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">From revenue to net profit</h3>
        <span className="text-xs text-zinc-500">Each bar is the amount remaining</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Profit waterfall chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1} />
        {stages.map((s, i) => {
          const cx = pad.l + bw * i + bw / 2;
          const top = Math.min(y(s.amount), zeroY);
          const h = Math.abs(zeroY - y(s.amount));
          const isLast = i === stages.length - 1;
          const fill = s.amount < 0 ? "#fb7185" : isLast ? "#f97316" : i === 0 ? "#fdba74" : "#fb923c";
          return (
            <g key={s.label}>
              <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(h, 1)} rx={3} fill={fill} />
              <text x={cx} y={H - 26} textAnchor="middle" className="fill-zinc-500" fontSize={9.5}>{s.label}</text>
              <text x={cx} y={H - 13} textAnchor="middle" className="fill-zinc-400" fontSize={9.5}>{formatCompact(s.amount)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
