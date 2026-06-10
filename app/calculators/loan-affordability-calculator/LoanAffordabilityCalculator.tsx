"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLoanAffordability,
  formatUSD,
  formatCompact,
  type LoanAffordabilityResult,
} from "@/lib/calculators/loan-affordability";

type FormState = {
  monthlyIncome: string;
  monthlyDebts: string;
  dtiPct: string;
  annualRatePct: string;
  termYears: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "6000",
  monthlyDebts: "650",
  dtiPct: "36",
  annualRatePct: "7.5",
  termYears: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LoanAffordabilityResult | null {
  return computeLoanAffordability({
    monthlyIncome: num(f.monthlyIncome),
    monthlyDebts: num(f.monthlyDebts) || 0,
    dtiPct: num(f.dtiPct),
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
  });
}

export default function LoanAffordabilityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LoanAffordabilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter income, a DTI between 0 and 100, a term in years, and non-negative debts and rate.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your budget</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Tell us your income and debts, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Monthly income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="debts">Existing debt payments</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debts" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyDebts} onChange={(e) => set("monthlyDebts", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="dti">Max DTI (%)</Label>
                <Input id="dti" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.dtiPct} onChange={(e) => set("dtiPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Term (years)</Label>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">You could borrow up to</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.loanAmount) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Affordable payment / mo" value={formatUSD(result.affordablePayment)} dot="bg-orange-500" />
                <Row label="Max total debt / mo" value={formatUSD(result.maxTotalDebtPayment)} dot="bg-orange-300" />
                <Row label="Total interest" value={formatUSD(result.totalInterest)} dot="bg-amber-400" />
                <Row label="Total of payments" value={formatUSD(result.totalOfPayments)} dot="bg-zinc-300" />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Rate sensitivity chart */}
      {result && result.schedule.length > 1 && result.loanAmount > 0 && <RateChart result={result} />}
    </div>
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function RateChart({ result }: { result: LoanAffordabilityResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.loanAmount)) || 1;
  const n = data.length;

  const bandW = innerW / n;
  const barW = bandW * 0.6;
  const x = (i: number) => pad.l + bandW * i + (bandW - barW) / 2;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">How much you can borrow at each rate</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Loan amount</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Affordable loan amount by interest rate">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((p, i) => {
          const yy = y(p.loanAmount);
          const h = pad.t + innerH - yy;
          return (
            <g key={i}>
              <rect x={x(i)} y={yy} width={barW} height={Math.max(0, h)} rx={3} fill="#f97316" />
              <text x={x(i) + barW / 2} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={9}>
                {p.ratePct.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
