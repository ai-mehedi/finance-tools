"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computePension,
  formatUSD,
  formatCompact,
  type PensionResult,
} from "@/lib/calculators/pension";

type FormState = {
  currentSalary: string;
  currentAge: string;
  retirementAge: string;
  yearsOfService: string;
  multiplierPct: string;
  salaryGrowthPct: string;
  normalRetirementAge: string;
  adjustmentPerYearPct: string;
};

const DEFAULTS: FormState = {
  currentSalary: "60000",
  currentAge: "45",
  retirementAge: "65",
  yearsOfService: "30",
  multiplierPct: "1.5",
  salaryGrowthPct: "2",
  normalRetirementAge: "65",
  adjustmentPerYearPct: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PensionResult | null {
  return computePension({
    currentSalary: num(f.currentSalary),
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    yearsOfService: num(f.yearsOfService) || 0,
    multiplierPct: num(f.multiplierPct) || 0,
    salaryGrowthPct: num(f.salaryGrowthPct) || 0,
    normalRetirementAge: num(f.normalRetirementAge) || num(f.retirementAge),
    adjustmentPerYearPct: num(f.adjustmentPerYearPct) || 0,
  });
}

export default function PensionCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PensionResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a salary above zero and a retirement age that is not before your current age.");
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your scheme details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salary">Current salary</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSalary} onChange={(e) => set("currentSalary", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="service">Years of service</Label>
                <Input id="service" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsOfService} onChange={(e) => set("yearsOfService", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="age">Current age</Label>
                <Input id="age" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retire">Retirement age</Label>
                <Input id="retire" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mult">Accrual (% / yr)</Label>
                <Input id="mult" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.multiplierPct} onChange={(e) => set("multiplierPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="growth">Pay rise (% / yr)</Label>
                <Input id="growth" type="number" step="any" inputMode="decimal" className="h-11" value={form.salaryGrowthPct} onChange={(e) => set("salaryGrowthPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="normal">Normal age</Label>
                <Input id="normal" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.normalRetirementAge} onChange={(e) => set("normalRetirementAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="adj">Adjust (% / yr)</Label>
                <Input id="adj" type="number" step="any" inputMode="decimal" className="h-11" value={form.adjustmentPerYearPct} onChange={(e) => set("adjustmentPerYearPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Annual pension</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.annualPension) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm text-zinc-500">
              about {formatUSD(result.monthlyPension)} a month
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Projected final salary" value={formatUSD(result.finalSalary)} />
                <Row label="Total accrual rate" value={`${(Math.round(result.totalAccrualPct * 100) / 100).toLocaleString("en-US")}%`} />
                <Row label="Timing adjustment" value={`x ${(Math.round(result.adjustmentFactor * 1000) / 1000).toLocaleString("en-US")}`} />
                <Row label="Replacement ratio" value={`${Math.round(result.replacementRatio * 100)}%`} />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <AccrualChart result={result} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function AccrualChart({ result }: { result: PensionResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const a0 = data[0].age;
  const aN = data[data.length - 1].age;
  const span = aN - a0 || 1;
  const maxVal = Math.max(...data.map((p) => p.accruedAnnual)) || 1;

  const x = (age: number) => pad.l + ((age - a0) / span) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.accruedAnnual).toFixed(1)}`);
  const areaPath = `M${x(a0)},${y(0)} L${pts.join(" L")} L${x(aN)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [a0, Math.round((a0 + aN) / 2), aN].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Annual benefit by age</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Accrued pension
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pension accrual by age chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="pensionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pensionFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>age {t}</text>
        ))}
      </svg>
    </div>
  );
}
