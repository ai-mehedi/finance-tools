"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computePmi,
  formatUSD,
  formatUSD2,
  formatCompact,
  type PmiResult,
} from "@/lib/calculators/pmi";

type FormState = {
  homePrice: string;
  downPayment: string;
  annualRatePct: string;
  termYears: string;
  pmiRatePct: string;
};

const DEFAULTS: FormState = {
  homePrice: "350000",
  downPayment: "35000",
  annualRatePct: "6.5",
  termYears: "30",
  pmiRatePct: "0.7",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PmiResult | null {
  return computePmi({
    homePrice: num(f.homePrice),
    downPayment: num(f.downPayment) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
    pmiRatePct: num(f.pmiRatePct) || 0,
  });
}

function monthLabel(m: number | null): string {
  if (m === null) return "Not within term";
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (yrs === 0) return `${mos} mo`;
  if (mos === 0) return `${yrs} yr`;
  return `${yrs} yr ${mos} mo`;
}

export default function PmiCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PmiResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a home price above the down payment, a term over 0 years, and non-negative rates.");
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
        { label: "Loan amount", value: formatUSD(result.loanAmount) },
        { label: "Down payment", value: `${result.downPaymentPct.toFixed(1)}%` },
        { label: "PMI / month (start)", value: formatUSD2(result.monthlyPmiInitial) },
        { label: "PMI drops off at", value: monthLabel(result.cancelMonth) },
        { label: "Months paying PMI", value: `${result.monthsWithPmi}` },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your loan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the purchase details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Home price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.homePrice} onChange={(e) => set("homePrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="down">Down payment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="down" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.downPayment} onChange={(e) => set("downPayment", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Term (yrs)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pmi">PMI rate (%)</Label>
                <Input id="pmi" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.pmiRatePct} onChange={(e) => set("pmiRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total PMI cost</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalPmiCost) : "—"}
          </p>
          {result && !result.requiresPmi && (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              No PMI needed: your down payment is at least 20 percent.
            </p>
          )}
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

      {/* LTV chart */}
      {result && result.schedule.length > 1 && <LtvChart result={result} />}
    </div>
  );
}

function LtvChart({ result }: { result: PmiResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 48, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = 100; // LTV percent

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const ltvPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.ltv).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${ltvPts.join(" L")} L${x(years)},${y(0)} Z`;
  const ltvLine = `M${ltvPts.join(" L")}`;
  const cutoffY = y(80);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Loan-to-value over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> LTV</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> 80% cutoff</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan to value over time chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{g.v}%</text>
          </g>
        ))}
        <defs>
          <linearGradient id="pmiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pmiFill)" />
        <path d={ltvLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* 80% cutoff line */}
        <line x1={pad.l} y1={cutoffY} x2={W - pad.r} y2={cutoffY} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
