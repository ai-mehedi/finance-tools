"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBiweeklyMortgage,
  formatUSD,
  formatUSD2,
  formatCompact,
  formatMonths,
  type BiweeklyMortgageResult,
} from "@/lib/calculators/biweekly-mortgage";

type FormState = {
  loanAmount: string;
  annualRatePct: string;
  termYears: string;
};

const DEFAULTS: FormState = {
  loanAmount: "300000",
  annualRatePct: "6.5",
  termYears: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BiweeklyMortgageResult | null {
  return computeBiweeklyMortgage({
    loanAmount: num(f.loanAmount) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
  });
}

export default function BiweeklyMortgageCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BiweeklyMortgageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a loan amount and term greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Loan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="loanAmount">Loan amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="loanAmount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Loan term (years)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Interest saved</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.interestSaved) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Monthly payment</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyPayment)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Biweekly payment</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.biweeklyPayment)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Time saved</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatMonths(result.monthsSaved)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Biweekly pays off in about{" "}
              <span className="font-semibold text-zinc-600">{result.biweeklyPayoffYears.toFixed(1)} years</span>{" "}
              vs {result.monthlyPayoffYears} years on the standard monthly plan.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}
    </div>
  );
}

function BalanceChart({ result }: { result: BiweeklyMortgageResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = result.loanAmount || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const monthlyPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.monthlyBalance).toFixed(1)}`);
  const biweeklyPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.biweeklyBalance).toFixed(1)}`);
  const monthlyLine = `M${monthlyPts.join(" L")}`;
  const biweeklyLine = `M${biweeklyPts.join(" L")}`;
  const biweeklyArea = `M${x(0)},${y(0)} L${biweeklyPts.join(" L")} L${x(years)},${y(0)} Z`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-zinc-900">Remaining balance over time</h3>
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-400" /> Monthly</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Biweekly</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Biweekly versus monthly mortgage balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="bwFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={biweeklyArea} fill="url(#bwFill)" />
        <path d={monthlyLine} fill="none" stroke="#a1a1aa" strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
        <path d={biweeklyLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
