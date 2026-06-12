"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRentAffordability,
  formatUSD,
  formatCompact,
  type RentAffordabilityResult,
} from "@/lib/calculators/rent-affordability";

type FormState = {
  monthlyIncome: string;
  monthlyDebt: string;
  rentPercent: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "5000",
  monthlyDebt: "400",
  rentPercent: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RentAffordabilityResult | null {
  return computeRentAffordability({
    monthlyIncome: num(f.monthlyIncome),
    monthlyDebt: num(f.monthlyDebt) || 0,
    rentPercent: num(f.rentPercent),
  });
}

export default function RentAffordabilityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RentAffordabilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a monthly income above 0, a non-negative debt amount and a rent share between 1 and 100.");
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
        { label: "Target at chosen share", value: result.rawTargetRent, color: "bg-zinc-300" },
        { label: "Rent-to-income", value: `${result.rentToIncomePct.toFixed(1)}%`, color: "bg-orange-300", isText: true },
        { label: "Left after rent and debt", value: result.remainingAfterRent, color: "bg-emerald-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Gross monthly income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="debt">Monthly debt payments</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debt" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyDebt} onChange={(e) => set("monthlyDebt", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="share">Target rent share of income (%)</Label>
              <Input id="share" type="number" min={1} max={100} step="any" inputMode="decimal" className="h-11" value={form.rentPercent} onChange={(e) => set("rentPercent", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Affordable rent</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.recommendedRent) : "—"}
          </p>
          {result?.debtAdjusted && (
            <p className="mt-1 text-xs font-medium text-rose-500">Trimmed below your target so total debt stays under 43 percent of income.</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {b.isText ? (b.value as string) : formatUSD(b.value as number)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Affordability bands chart */}
      {result && <BandsChart result={result} />}
    </div>
  );
}

function BandsChart({ result }: { result: RentAffordabilityResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const bars = result.bands;
  const maxVal = Math.max(...bars.map((b) => b.rent), result.recommendedRent) || 1;

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;
  const slot = innerW / bars.length;
  const barW = Math.min(70, slot * 0.5);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  const recY = y(result.recommendedRent);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Rent by comfort band</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Band rent</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-500" /> Your recommended</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Rent affordability bands chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(b.rent);
          return (
            <g key={b.label}>
              <rect x={cx - barW / 2} y={top} width={barW} height={pad.t + innerH - top} rx={4} fill="#fb923c" opacity={0.85} />
              <text x={cx} y={top - 6} textAnchor="middle" className="fill-zinc-600" fontSize={10} fontWeight={700}>{formatCompact(b.rent)}</text>
              <text x={cx} y={H - 18} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{b.label}</text>
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-zinc-400" fontSize={9}>{b.percent}%</text>
            </g>
          );
        })}
        <line x1={pad.l} y1={recY} x2={W - pad.r} y2={recY} stroke="#52525b" strokeWidth={1.5} strokeDasharray="5 3" />
      </svg>
    </div>
  );
}
