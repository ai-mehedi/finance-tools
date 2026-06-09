"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeAutoLoanPayoff,
  formatUSD,
  formatUSD2,
  formatCompact,
  formatMonths,
  type AutoLoanPayoffResult,
} from "@/lib/calculators/auto-loan-payoff";

type FormState = {
  currentBalance: string;
  annualRatePct: string;
  monthlyPayment: string;
  extraMonthly: string;
};

const DEFAULTS: FormState = {
  currentBalance: "22000",
  annualRatePct: "7",
  monthlyPayment: "450",
  extraMonthly: "100",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AutoLoanPayoffResult | null {
  return computeAutoLoanPayoff({
    currentBalance: num(f.currentBalance) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    monthlyPayment: num(f.monthlyPayment) || 0,
    extraMonthly: num(f.extraMonthly) || 0,
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function AutoLoanPayoffCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<AutoLoanPayoffResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a balance and payment greater than 0. Your monthly payment must be large enough to cover the interest, or the loan will never pay off.");
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
            <Money id="currentBalance" label="Current loan balance" value={form.currentBalance} onChange={(v) => set("currentBalance", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <Money id="payment" label="Monthly payment" value={form.monthlyPayment} onChange={(v) => set("monthlyPayment", v)} />
            </div>
            <Money id="extra" label="Extra monthly payment (optional)" value={form.extraMonthly} onChange={(v) => set("extraMonthly", v)} />

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Time to payoff</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatMonths(result.withExtra.months) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Months to payoff</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.withExtra.months}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.withExtra.totalInterest)}</span>
                </div>
                {result.hasExtra && (
                  <>
                    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                      <span className="text-sm font-medium text-zinc-500">Interest saved</span>
                      <span className="text-sm font-bold tabular-nums text-emerald-600">{formatUSD(result.interestSaved)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                      <span className="text-sm font-medium text-zinc-500">Time saved</span>
                      <span className="text-sm font-bold tabular-nums text-emerald-600">{formatMonths(result.monthsSaved)}</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && result.hasExtra && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Without the extra payment, payoff takes{" "}
              <span className="font-semibold text-zinc-600">{formatMonths(result.withoutExtra.months)}</span> and{" "}
              <span className="font-semibold text-zinc-600">{formatUSD2(result.withoutExtra.totalInterest)}</span> in interest.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}
    </div>
  );
}

function BalanceChart({ result }: { result: AutoLoanPayoffResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = data[0].balance || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Remaining balance over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Auto loan payoff balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="payoffFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#payoffFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
