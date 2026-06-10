"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeEpf,
  formatUSD,
  formatCompact,
  type EpfResult,
} from "@/lib/calculators/epf";

type FormState = {
  monthlyBasicDA: string;
  employeeRatePct: string;
  employerRatePct: string;
  currentAge: string;
  retirementAge: string;
  annualInterestPct: string;
  salaryGrowthPct: string;
  currentBalance: string;
};

const DEFAULTS: FormState = {
  monthlyBasicDA: "30000",
  employeeRatePct: "12",
  employerRatePct: "12",
  currentAge: "28",
  retirementAge: "58",
  annualInterestPct: "8.25",
  salaryGrowthPct: "6",
  currentBalance: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): EpfResult | null {
  return computeEpf({
    monthlyBasicDA: num(f.monthlyBasicDA),
    employeeRatePct: num(f.employeeRatePct) || 0,
    employerRatePct: num(f.employerRatePct) || 0,
    currentAgePct: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    annualInterestPct: num(f.annualInterestPct) || 0,
    salaryGrowthPct: num(f.salaryGrowthPct) || 0,
    currentBalance: num(f.currentBalance) || 0,
  });
}

export default function EpfCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EpfResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive monthly wage and a retirement age greater than your current age.");
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
        { label: "Your contribution", value: result.totalEmployee, color: "bg-zinc-300" },
        { label: "Employer (EPF share)", value: result.totalEmployer, color: "bg-orange-300" },
        { label: "Interest earned", value: result.totalInterest, color: "bg-orange-500" },
        { label: "Diverted to pension (EPS)", value: result.totalEpsDiverted, color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your wage and assumptions, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wage">Monthly basic + DA</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="wage" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyBasicDA} onChange={(e) => set("monthlyBasicDA", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="balance">Current EPF balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentBalance} onChange={(e) => set("currentBalance", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="empRate">Your share (%)</Label>
                <Input id="empRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.employeeRatePct} onChange={(e) => set("employeeRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="erRate">Employer share (%)</Label>
                <Input id="erRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.employerRatePct} onChange={(e) => set("employerRatePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curAge">Current age</Label>
                <Input id="curAge" type="number" min={15} step="1" inputMode="numeric" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retAge">Retirement age</Label>
                <Input id="retAge" type="number" min={16} step="1" inputMode="numeric" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualInterestPct} onChange={(e) => set("annualInterestPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="growth">Annual increment (%)</Label>
                <Input id="growth" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.salaryGrowthPct} onChange={(e) => set("salaryGrowthPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">EPF corpus at retirement</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.maturityBalance) : "—"}
          </p>
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

      {/* Growth chart */}
      {result && result.schedule.length > 1 && <CorpusChart result={result} />}
    </div>
  );
}

function CorpusChart({ result }: { result: EpfResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  // Cumulative contributions line (employee + employer EPF share).
  let cumContrib = data[0].balance;
  const contribSeries = data.map((p, i) => {
    if (i > 0) cumContrib += p.employeeContrib + p.employerContrib;
    return cumContrib;
  });

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const contribPts = data.map((p, i) => `${x(p.year).toFixed(1)},${y(contribSeries[i]).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const contribLine = `M${contribPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Corpus over your career</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Corpus</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Contributed</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="EPF corpus growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="epfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#epfFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={contribLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
