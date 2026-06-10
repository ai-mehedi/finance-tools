"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeIncomeProtection,
  formatUSD,
  formatCompact,
  type IncomeProtectionResult,
} from "@/lib/calculators/income-protection";

type FormState = {
  annualIncome: string;
  coverPct: string;
  monthlyEssentialExpenses: string;
  existingMonthlyCover: string;
  waitingWeeks: string;
  currentAge: string;
  retirementAge: string;
};

const DEFAULTS: FormState = {
  annualIncome: "75000",
  coverPct: "60",
  monthlyEssentialExpenses: "3200",
  existingMonthlyCover: "0",
  waitingWeeks: "4",
  currentAge: "35",
  retirementAge: "65",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): IncomeProtectionResult | null {
  return computeIncomeProtection({
    annualIncome: num(f.annualIncome),
    coverPct: num(f.coverPct),
    monthlyEssentialExpenses: num(f.monthlyEssentialExpenses) || 0,
    existingMonthlyCover: num(f.existingMonthlyCover) || 0,
    waitingWeeks: num(f.waitingWeeks) || 0,
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
  });
}

export default function IncomeProtectionCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<IncomeProtectionResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter income above 0, a cover percentage between 1 and 100, and a retirement age above your current age.");
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
        { label: "Insurer cap (65% of income)", value: `${formatUSD(result.maxBenefitMonthly)}/mo`, color: "bg-zinc-300" },
        { label: "Additional cover to buy", value: `${formatUSD(result.additionalMonthlyBenefit)}/mo`, color: "bg-orange-300" },
        { label: "Waiting period", value: `${result.waitingDays} days`, color: "bg-orange-400" },
        { label: "Total payable to retirement", value: formatUSD(result.totalBenefitToRetirement), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your situation</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Tell us about your income and costs, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Annual income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="coverPct">Income to replace (%)</Label>
                <Input id="coverPct" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.coverPct} onChange={(e) => set("coverPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expenses">Essential monthly costs</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyEssentialExpenses} onChange={(e) => set("monthlyEssentialExpenses", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="existing">Existing cover (/mo)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="existing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingMonthlyCover} onChange={(e) => set("existingMonthlyCover", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="wait">Waiting (weeks)</Label>
                <Input id="wait" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.waitingWeeks} onChange={(e) => set("waitingWeeks", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="curAge">Current age</Label>
                <Input id="curAge" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retAge">Retire age</Label>
                <Input id="retAge" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly benefit</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${formatUSD(result.recommendedMonthlyBenefit)}` : "—"}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {result
              ? result.coversExpenses
                ? <>Covers your <span className="text-orange-600">{formatUSD(num(form.monthlyEssentialExpenses) || 0)}</span> of costs</>
                : <>Leaves a <span className="text-rose-500">{formatUSD(result.monthlyShortfall)}</span>/mo gap</>
              : "Enter valid values"}
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

      {/* Cumulative benefit chart */}
      {result && result.schedule.length > 1 && <BenefitChart result={result} />}
    </div>
  );
}

function BenefitChart({ result }: { result: IncomeProtectionResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  // Show up to ~24 bars to keep it readable.
  const all = result.schedule.filter((p) => p.year > 0);
  const step = Math.max(1, Math.ceil(all.length / 24));
  const data = all.filter((_, i) => i % step === 0);

  const maxVal = Math.max(...data.map((p) => p.cumulativeBenefit)) || 1;
  const barW = innerW / data.length;

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative benefit if claimed to retirement</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Total paid</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative income protection benefit chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="ipFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const bx = pad.l + i * barW + barW * 0.15;
          const bw = barW * 0.7;
          const by = y(p.cumulativeBenefit);
          const bh = pad.t + innerH - by;
          return <rect key={p.year} x={bx} y={by} width={bw} height={Math.max(0, bh)} rx={2} fill="url(#ipFill)" />;
        })}
        {data
          .filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2))
          .map((p) => {
            const idx = data.indexOf(p);
            const cx = pad.l + idx * barW + barW / 2;
            return <text key={p.year} x={cx} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>age {p.age}</text>;
          })}
      </svg>
    </div>
  );
}
