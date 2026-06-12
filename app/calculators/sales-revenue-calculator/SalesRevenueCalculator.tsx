"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeSalesRevenue,
  formatUSD,
  formatCompact,
  type SalesRevenueResult,
} from "@/lib/calculators/sales-revenue";

type FormState = {
  unitsSold: string;
  pricePerUnit: string;
  unitCost: string;
  discountPct: string;
  returnsPct: string;
};

const DEFAULTS: FormState = {
  unitsSold: "1200",
  pricePerUnit: "49",
  unitCost: "18",
  discountPct: "10",
  returnsPct: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SalesRevenueResult | null {
  return computeSalesRevenue({
    unitsSold: num(f.unitsSold),
    pricePerUnit: num(f.pricePerUnit),
    unitCost: num(f.unitCost) || 0,
    discountPct: num(f.discountPct) || 0,
    returnsPct: num(f.returnsPct) || 0,
  });
}

export default function SalesRevenueCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SalesRevenueResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative units and prices, with discount and returns each between 0 and 100 percent.");
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

  const breakdown = result
    ? [
        { label: "Gross revenue", value: result.grossRevenue, color: "bg-zinc-300" },
        { label: "Discounts", value: -result.discountAmount, color: "bg-amber-300" },
        { label: "Returns", value: -result.returnsAmount, color: "bg-orange-300" },
        { label: "Gross profit", value: result.grossProfit, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your sales figures, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="units">Units sold</Label>
                <Input id="units" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.unitsSold} onChange={(e) => set("unitsSold", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="price">Price per unit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="cost">Cost / unit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.unitCost} onChange={(e) => set("unitCost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.discountPct} onChange={(e) => set("discountPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="returns">Returns (%)</Label>
                <Input id="returns" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.returnsPct} onChange={(e) => set("returnsPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net sales revenue</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netRevenue) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Gross margin {result.grossMarginPct.toFixed(1)}%
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
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

      {/* Revenue-vs-volume chart */}
      {result && result.schedule.length > 1 && <RevenueChart result={result} />}
    </div>
  );
}

function RevenueChart({ result }: { result: SalesRevenueResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxUnits = data[data.length - 1].units || 1;
  const maxVal = Math.max(...data.map((p) => p.netRevenue), 1);

  const x = (u: number) => pad.l + (u / maxUnits) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const revPts = data.map((p) => `${x(p.units).toFixed(1)},${y(p.netRevenue).toFixed(1)}`);
  const profitPts = data.map((p) => `${x(p.units).toFixed(1)},${y(p.grossProfit).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${revPts.join(" L")} L${x(maxUnits)},${y(0)} Z`;
  const revLine = `M${revPts.join(" L")}`;
  const profitLine = `M${profitPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(maxUnits / 2), Math.round(maxUnits)].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Revenue and profit vs units sold</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Net revenue</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Gross profit</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue and profit against units sold chart">
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
        <path d={revLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={profitLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{formatCompact(t).replace("$", "")} u</text>
        ))}
      </svg>
    </div>
  );
}
