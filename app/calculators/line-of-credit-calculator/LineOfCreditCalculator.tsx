"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLineOfCredit,
  formatUSD,
  formatUSD2,
  formatCompact,
  formatMonths,
  type LineOfCreditResult,
} from "@/lib/calculators/line-of-credit";

type FormState = {
  drawAmount: string;
  annualRatePct: string;
  monthlyPayment: string;
};

const DEFAULTS: FormState = {
  drawAmount: "25000",
  annualRatePct: "9.5",
  monthlyPayment: "600",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LineOfCreditResult | null {
  return computeLineOfCredit({
    drawAmount: num(f.drawAmount),
    annualRatePct: num(f.annualRatePct) || 0,
    monthlyPayment: num(f.monthlyPayment),
  });
}

export default function LineOfCreditCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LineOfCreditResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a balance and monthly payment greater than 0 and a non-negative rate.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your line of credit</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter what you owe and pay, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="draw">Current balance drawn</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="draw" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.drawAmount} onChange={(e) => set("drawAmount", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% APR)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="payment">Monthly payment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="payment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyPayment} onChange={(e) => set("monthlyPayment", e.target.value)} />
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
          {result && !result.feasible ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Balance will not fall</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">Payment too low</p>
              <p className="mt-3 rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-600">
                Your first month of interest is {formatUSD2(result.monthlyInterestFirst)}. Pay more than that each month so the balance can start to shrink.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Time to pay off</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
                {result ? formatMonths(result.monthsToPayoff) : "—"}
              </p>
              <div className="mt-5 space-y-2">
                {result ? (
                  <>
                    <Row label="Total interest" value={formatUSD(result.totalInterest)} dot="bg-orange-500" />
                    <Row label="Total paid" value={formatUSD(result.totalPaid)} dot="bg-orange-300" />
                    <Row label="First month interest" value={formatUSD2(result.monthlyInterestFirst)} dot="bg-zinc-300" />
                  </>
                ) : (
                  <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
                )}
              </div>
            </>
          )}
        </div>
      </form>

      {/* Payoff chart */}
      {result && result.feasible && result.schedule.length > 1 && <PayoffChart result={result} />}
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

function PayoffChart({ result }: { result: LineOfCreditResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  // Sample the monthly schedule down to keep the path light.
  const raw = result.schedule;
  const months = raw[raw.length - 1].month || 1;
  const stride = Math.max(1, Math.ceil(raw.length / 80));
  const data = raw.filter((p, i) => i % stride === 0 || i === raw.length - 1);

  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(months)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const yearsTotal = Math.round(months / 12);
  const xTicks = Array.from({ length: Math.min(yearsTotal, 6) + 1 }, (_, i) =>
    Math.round((months / Math.min(yearsTotal, 6) || months) * i)
  ).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Line of credit payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="locFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#locFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{Math.round(t / 12)} yr</text>
        ))}
      </svg>
    </div>
  );
}
