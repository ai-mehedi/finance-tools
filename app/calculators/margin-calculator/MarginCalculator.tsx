"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeMargin,
  formatUSD,
  formatCompact,
  type MarginMode,
  type MarginResult,
} from "@/lib/calculators/margin";

const MODES: { value: MarginMode; label: string }[] = [
  { value: "fromPrice", label: "Cost and selling price" },
  { value: "fromMargin", label: "Cost and target margin" },
];

type FormState = {
  cost: string;
  revenue: string;
  targetMarginPct: string;
  mode: MarginMode;
};

const DEFAULTS: FormState = {
  cost: "60",
  revenue: "100",
  targetMarginPct: "40",
  mode: "fromPrice",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MarginResult | null {
  return computeMargin({
    cost: num(f.cost),
    revenue: num(f.revenue) || 0,
    targetMarginPct: num(f.targetMarginPct) || 0,
    mode: f.mode,
  });
}

export default function MarginCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MarginResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError(
        form.mode === "fromMargin"
          ? "Enter a non-negative cost and a target margin below 100%."
          : "Enter a non-negative cost and a selling price greater than 0.",
      );
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
        { label: "Cost", value: result.cost, color: "bg-zinc-300" },
        { label: "Gross profit", value: result.grossProfit, color: "bg-orange-500" },
        { label: "Selling price", value: result.revenue, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Choose how you want to work, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="mode">I want to enter</Label>
              <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as MarginMode)}>
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost">Cost of goods</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
                </div>
              </div>
              {form.mode === "fromPrice" ? (
                <div>
                  <Label htmlFor="revenue">Selling price</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="targetMargin">Target margin (%)</Label>
                  <Input id="targetMargin" type="number" min={0} max={99} step="any" inputMode="decimal" className="h-11" value={form.targetMarginPct} onChange={(e) => set("targetMarginPct", e.target.value)} />
                </div>
              )}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Gross margin</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${result.marginPct.toFixed(1)}%` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                      {b.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Equivalent markup</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.markupPct.toFixed(1)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Split chart */}
      {result && result.revenue > 0 && <MarginChart result={result} />}
    </div>
  );
}

function MarginChart({ result }: { result: MarginResult }) {
  const W = 640;
  const H = 200;
  const cx = 110;
  const cy = H / 2;
  const r = 72;
  const stroke = 26;

  const total = result.revenue || 1;
  const costShare = result.cost / total;
  const profitShare = result.grossProfit / total;

  const circ = 2 * Math.PI * r;
  const costLen = costShare * circ;
  const profitLen = profitShare * circ;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where the price goes</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-zinc-300" /> Cost</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Profit</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Margin breakdown donut chart">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#d4d4d8" strokeWidth={stroke} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f97316"
            strokeWidth={stroke}
            strokeDasharray={`${profitLen.toFixed(1)} ${(circ - profitLen).toFixed(1)}`}
            strokeDashoffset={(-costLen).toFixed(1)}
          />
        </g>
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={22} fontWeight={800}>
          {result.marginPct.toFixed(0)}%
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={11}>margin</text>

        <g>
          <text x={230} y={cy - 30} className="fill-zinc-500" fontSize={12}>Selling price</text>
          <text x={230} y={cy - 10} className="fill-zinc-900" fontSize={18} fontWeight={800}>{formatCompact(result.revenue)}</text>
          <text x={230} y={cy + 22} className="fill-zinc-500" fontSize={12}>Cost {formatCompact(result.cost)}</text>
          <text x={230} y={cy + 42} className="fill-orange-600" fontSize={12}>Profit {formatCompact(result.grossProfit)}</text>
        </g>
      </svg>
    </div>
  );
}
