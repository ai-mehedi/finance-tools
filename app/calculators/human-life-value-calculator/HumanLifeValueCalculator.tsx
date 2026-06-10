"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeHumanLifeValue,
  formatUSD,
  formatCompact,
  type HumanLifeValueResult,
} from "@/lib/calculators/human-life-value";

type FormState = {
  currentAge: string;
  retirementAge: string;
  annualIncome: string;
  personalExpensePct: string;
  incomeGrowthPct: string;
  discountRatePct: string;
  existingSavings: string;
  existingCover: string;
};

const DEFAULTS: FormState = {
  currentAge: "35",
  retirementAge: "60",
  annualIncome: "80000",
  personalExpensePct: "25",
  incomeGrowthPct: "3",
  discountRatePct: "6",
  existingSavings: "50000",
  existingCover: "100000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HumanLifeValueResult | null {
  return computeHumanLifeValue({
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    annualIncome: num(f.annualIncome),
    personalExpensePct: num(f.personalExpensePct) || 0,
    incomeGrowthPct: num(f.incomeGrowthPct) || 0,
    discountRatePct: num(f.discountRatePct) || 0,
    existingSavings: num(f.existingSavings) || 0,
    existingCover: num(f.existingCover) || 0,
  });
}

export default function HumanLifeValueCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HumanLifeValueResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Check your entries: retirement age must be above current age, income above 0, and the personal-spend share below 100%.");
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
        { label: "Working years left", value: `${result.yearsOfIncome} yrs`, color: "bg-zinc-300" },
        { label: "Income replaced (today's $)", value: formatUSD(result.humanLifeValue), color: "bg-orange-300" },
        { label: "Existing savings + cover", value: formatUSD((num(form.existingSavings) || 0) + (num(form.existingCover) || 0)), color: "bg-orange-400" },
        { label: "Suggested new cover", value: formatUSD(result.recommendedCover), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your income and assumptions, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curAge">Current age</Label>
                <Input id="curAge" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retAge">Retirement age</Label>
                <Input id="retAge" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="income">Annual income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="spend">Self-spend (%)</Label>
                <Input id="spend" type="number" min={0} max={99} step="any" inputMode="decimal" className="h-11" value={form.personalExpensePct} onChange={(e) => set("personalExpensePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="growth">Income growth (%)</Label>
                <Input id="growth" type="number" step="any" inputMode="decimal" className="h-11" value={form.incomeGrowthPct} onChange={(e) => set("incomeGrowthPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" step="any" inputMode="decimal" className="h-11" value={form.discountRatePct} onChange={(e) => set("discountRatePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="savings">Existing savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="savings" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingSavings} onChange={(e) => set("existingSavings", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cover">Existing life cover</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cover" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingCover} onChange={(e) => set("existingCover", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Human life value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.humanLifeValue) : "—"}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {result ? <>Suggested new cover: <span className="text-orange-600">{formatUSD(result.recommendedCover)}</span></> : "Enter valid values"}
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

      {/* Chart */}
      {result && result.schedule.length > 1 && <HlvChart result={result} />}
    </div>
  );
}

function HlvChart({ result }: { result: HumanLifeValueResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.cumulativePV)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pvPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.cumulativePV).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pvPts.join(" L")} L${x(years)},${y(0)} Z`;
  const pvLine = `M${pvPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Income value accumulated (today's dollars)</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Present value</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Human life value accumulation chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="hlvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#hlvFill)" />
        <path d={pvLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
