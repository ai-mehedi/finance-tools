"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeProfitMargin,
  formatUSD,
  formatPct,
  type ProfitMarginResult,
} from "@/lib/calculators/profit-margin";

type FormState = {
  revenue: string;
  cost: string;
};

const DEFAULTS: FormState = {
  revenue: "10000",
  cost: "6500",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ProfitMarginResult | null {
  return computeProfitMargin({
    revenue: num(f.revenue),
    cost: num(f.cost) || 0,
  });
}

export default function ProfitMarginCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ProfitMarginResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a revenue greater than 0 and a non-negative cost.");
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
        { label: "Gross profit", value: formatUSD(result.profit) },
        { label: "Net profit margin", value: formatPct(result.marginPct) },
        { label: "Markup on cost", value: formatPct(result.markupPct) },
        { label: "Cost as % of revenue", value: formatPct(result.costRatioPct) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter sales and cost, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revenue">Revenue (sales)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cost">Total cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Profit margin</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.marginPct) : "—"}
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

      {/* Donut chart */}
      {result && result.profit >= 0 && <MarginDonut result={result} />}
    </div>
  );
}

function MarginDonut({ result }: { result: ProfitMarginResult }) {
  const total = result.slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  const cx = 90;
  const cy = 90;

  const colors: Record<string, string> = {
    "bg-zinc-300": "#d4d4d8",
    "bg-orange-500": "#f97316",
  };

  let offset = 0;
  const arcs = result.slices.map((s) => {
    const frac = s.value / total;
    const dash = frac * C;
    const arc = { ...s, dash, gap: C - dash, dashoffset: -offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where each revenue dollar goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <svg viewBox="0 0 180 180" className="h-44 w-44" role="img" aria-label="Profit margin donut chart">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f4f4f5" strokeWidth={22} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={colors[a.color] || "#fb923c"}
              strokeWidth={22}
              strokeDasharray={`${a.dash.toFixed(2)} ${a.gap.toFixed(2)}`}
              strokeDashoffset={a.dashoffset.toFixed(2)}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-zinc-900" fontSize={20} fontWeight={800}>
            {formatPct(result.marginPct)}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={10}>margin</text>
        </svg>
        <div className="w-full space-y-2 sm:w-auto sm:flex-1">
          {result.slices.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-6 rounded-lg bg-zinc-50 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                {s.label}
              </span>
              <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(s.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
