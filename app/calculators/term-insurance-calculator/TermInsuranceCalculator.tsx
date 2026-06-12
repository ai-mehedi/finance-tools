"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeTermInsurance,
  formatUSD,
  formatCompact,
  type TermInsuranceResult,
} from "@/lib/calculators/term-insurance";

type FormState = {
  annualIncome: string;
  yearsToReplace: string;
  mortgageBalance: string;
  otherDebts: string;
  educationFund: string;
  finalExpenses: string;
  existingCover: string;
  liquidSavings: string;
  age: string;
  termYears: string;
};

const DEFAULTS: FormState = {
  annualIncome: "70000",
  yearsToReplace: "15",
  mortgageBalance: "220000",
  otherDebts: "20000",
  educationFund: "100000",
  finalExpenses: "15000",
  existingCover: "50000",
  liquidSavings: "40000",
  age: "35",
  termYears: "20",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TermInsuranceResult | null {
  return computeTermInsurance({
    annualIncome: num(f.annualIncome) || 0,
    yearsToReplace: num(f.yearsToReplace) || 0,
    mortgageBalance: num(f.mortgageBalance) || 0,
    otherDebts: num(f.otherDebts) || 0,
    educationFund: num(f.educationFund) || 0,
    finalExpenses: num(f.finalExpenses) || 0,
    existingCover: num(f.existingCover) || 0,
    liquidSavings: num(f.liquidSavings) || 0,
    age: num(f.age),
    termYears: num(f.termYears),
  });
}

export default function TermInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TermInsuranceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a valid age (1 to 80), a term over 0, and non-negative amounts.");
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
        { label: "Income replacement", value: result.incomeNeed, color: "bg-orange-300" },
        { label: "Gross cover need", value: result.totalNeed, color: "bg-orange-500" },
        { label: "Cover and savings offset", value: result.offsets, color: "bg-emerald-400" },
        { label: "Estimated annual premium", value: result.estimatedAnnualPremium, color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Describe your household, then press Calculate.</p>

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
                <Label htmlFor="yrs">Years to replace</Label>
                <Input id="yrs" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsToReplace} onChange={(e) => set("yearsToReplace", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mortgage">Mortgage balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="mortgage" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.mortgageBalance} onChange={(e) => set("mortgageBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="debts">Other debts</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debts" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.otherDebts} onChange={(e) => set("otherDebts", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edu">Education fund</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="edu" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.educationFund} onChange={(e) => set("educationFund", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="final">Final expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="final" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.finalExpenses} onChange={(e) => set("finalExpenses", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cover">Existing cover</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cover" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingCover} onChange={(e) => set("existingCover", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="savings">Liquid savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="savings" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.liquidSavings} onChange={(e) => set("liquidSavings", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Your age</Label>
                <Input id="age" type="number" min={1} max={80} step="1" inputMode="numeric" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Policy term (years)</Label>
                <Input id="term" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Recommended cover</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.recommendedCover) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs text-zinc-500">
              About {formatUSD(result.estimatedMonthlyPremium)} per month indicative premium
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

      {/* Need-over-time chart */}
      {result && result.schedule.length > 1 && <NeedChart result={result} />}
    </div>
  );
}

function NeedChart({ result }: { result: TermInsuranceResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.needRemaining), 1);

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.needRemaining).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cover need over the term</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Remaining need</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Insurance need over time chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="tiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#tiFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
