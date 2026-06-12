"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeTermVsWhole,
  formatUSD,
  formatCompact,
  type TermVsWholeResult,
} from "@/lib/calculators/term-vs-whole-life";

type FormState = {
  coverAmount: string;
  annualTermPremium: string;
  annualWholePremium: string;
  wholeCashGrowthPct: string;
  investReturnPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  coverAmount: "500000",
  annualTermPremium: "400",
  annualWholePremium: "5200",
  wholeCashGrowthPct: "4",
  investReturnPct: "7",
  years: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TermVsWholeResult | null {
  return computeTermVsWhole({
    coverAmount: num(f.coverAmount) || 0,
    annualTermPremium: num(f.annualTermPremium) || 0,
    annualWholePremium: num(f.annualWholePremium) || 0,
    wholeCashGrowthPct: num(f.wholeCashGrowthPct) || 0,
    investReturnPct: num(f.investReturnPct) || 0,
    years: num(f.years),
  });
}

export default function TermVsWholeLifeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TermVsWholeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a horizon over 0 years and non-negative premiums.");
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

  const winner = result?.betterStrategy;

  const breakdown = result
    ? [
        { label: "Buy term, invest difference", value: result.finalSideFund, color: "bg-orange-500" },
        { label: "Whole life cash value", value: result.finalCashValue, color: "bg-zinc-400" },
        { label: "Total term premiums paid", value: result.totalTermPaid, color: "bg-orange-300" },
        { label: "Total whole life paid", value: result.totalWholePaid, color: "bg-emerald-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Compare two policies for the same cover, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="cover">Death benefit (cover)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="cover" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.coverAmount} onChange={(e) => set("coverAmount", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="termprem">Term annual premium</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="termprem" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualTermPremium} onChange={(e) => set("annualTermPremium", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="wholeprem">Whole life annual premium</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="wholeprem" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualWholePremium} onChange={(e) => set("annualWholePremium", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="cashrate">Cash value % / yr</Label>
                <Input id="cashrate" type="number" step="any" inputMode="decimal" className="h-11" value={form.wholeCashGrowthPct} onChange={(e) => set("wholeCashGrowthPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="invrate">Invest return % / yr</Label>
                <Input id="invrate" type="number" step="any" inputMode="decimal" className="h-11" value={form.investReturnPct} onChange={(e) => set("investReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Ahead at the horizon</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(Math.abs(result.advantage)) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-semibold text-zinc-600">
              {winner === "term"
                ? "Buy term and invest the difference comes out ahead"
                : "Whole life cash value comes out ahead"}
              {result.breakEvenYear ? ` · whole life overtakes in year ${result.breakEvenYear}` : ""}
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

      {/* Side-fund vs cash value chart */}
      {result && result.schedule.length > 1 && <CompareChart result={result} />}
    </div>
  );
}

function CompareChart({ result }: { result: TermVsWholeResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.sideFund, p.cashValue)), 1);

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const sidePts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.sideFund).toFixed(1)}`);
  const cashPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.cashValue).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${sidePts.join(" L")} L${x(years)},${y(0)} Z`;
  const sideLine = `M${sidePts.join(" L")}`;
  const cashLine = `M${cashPts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Side fund vs cash value</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Invested difference</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Cash value</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Term versus whole life comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="twFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#twFill)" />
        <path d={sideLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={cashLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
