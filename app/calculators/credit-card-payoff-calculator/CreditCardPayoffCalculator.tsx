"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCreditCardPayoff,
  formatUSD,
  formatUSD2,
  formatMonths,
  formatCompact,
  type CreditCardPayoffResult,
} from "@/lib/calculators/credit-card-payoff";

type FormState = {
  balance: string;
  annualRatePct: string;
  monthlyPayment: string;
};

const DEFAULTS: FormState = {
  balance: "6000",
  annualRatePct: "21.5",
  monthlyPayment: "250",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CreditCardPayoffResult | null {
  return computeCreditCardPayoff({
    balance: num(f.balance) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    monthlyPayment: num(f.monthlyPayment) || 0,
  });
}

export default function CreditCardPayoffCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CreditCardPayoffResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a balance and monthly payment greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Card details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="balance">Current balance</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">APR (% / yr)</Label>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Time to pay off</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? (result.minimumWarning ? "Never" : formatMonths(result.months)) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              result.minimumWarning ? (
                <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm font-medium text-rose-500">
                  Your payment of {formatUSD2(num(form.monthlyPayment) || 0)} does not cover the first month of interest ({formatUSD2(result.monthlyInterestFirst)}). The balance will never fall. Increase your payment.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Total interest</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Total paid</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Months to clear</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{result.months}</span>
                  </div>
                </>
              )
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && !result.minimumWarning && result.schedule.length > 1 && <BalanceChart result={result} />}
    </div>
  );
}

function BalanceChart({ result }: { result: CreditCardPayoffResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = data[0].balance || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(months)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Balance over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Credit card balance payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="ccpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#ccpFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
