"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeDebtPayoff,
  formatUSD,
  formatCompact,
  formatDuration,
  type DebtPayoffResult,
} from "@/lib/calculators/debt-payoff";

type FormState = {
  balance: string;
  aprPct: string;
  payment: string;
};

const DEFAULTS: FormState = {
  balance: "8000",
  aprPct: "19.99",
  payment: "250",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DebtPayoffResult | null {
  return computeDebtPayoff({
    balance: num(f.balance),
    aprPct: num(f.aprPct) || 0,
    payment: num(f.payment),
  });
}

// Distinguish "bad inputs" from "payment too low to ever clear the debt" so the
// error message can be specific.
function paymentTooLow(f: FormState): boolean {
  const balance = num(f.balance);
  const apr = num(f.aprPct) || 0;
  const payment = num(f.payment);
  if (!Number.isFinite(balance) || balance <= 0) return false;
  if (!Number.isFinite(payment) || payment <= 0) return false;
  const r = apr / 100 / 12;
  return r > 0 && payment <= balance * r;
}

export default function DebtPayoffCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DebtPayoffResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      if (paymentTooLow(form)) {
        setError(
          "Your monthly payment is too low to cover the interest, so the balance never clears. Increase the payment above the first month's interest charge.",
        );
      } else {
        setError("Enter a balance above 0, a valid APR, and a monthly payment above 0.");
      }
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
        { label: "Balance", value: num(form.balance) || 0, color: "bg-zinc-300" },
        { label: "Total interest", value: result.totalInterest, color: "bg-orange-300" },
        { label: "Total paid", value: result.totalPaid, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Debt details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your balance, rate and monthly payment, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance">Current balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="payment">Monthly payment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="payment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.payment} onChange={(e) => set("payment", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="apr">APR (%)</Label>
                <Input id="apr" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.aprPct} onChange={(e) => set("aprPct", e.target.value)} />
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
            {result ? `${result.months} mo` : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {formatDuration(result.years, result.monthsRemainder)} · {formatUSD(result.totalInterest)} interest
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

      {/* Payoff chart */}
      {result && result.schedule.length > 1 && <PayoffChart result={result} />}
    </div>
  );
}

function PayoffChart({ result }: { result: DebtPayoffResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;
  const lastMonth = data[data.length - 1].month || 1;

  const x = (i: number) => pad.l + (n === 1 ? 0 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const line = data.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.balance).toFixed(1)}`).join(" ");
  const area = `${line} L ${x(n - 1).toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  const tickEvery = Math.max(1, Math.round(n / 6));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Remaining balance</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Balance</span>
          <span className="text-zinc-400">over {lastMonth} mo</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Remaining debt balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#dpFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p, i) =>
          i % tickEvery === 0 || i === n - 1 ? (
            <text key={`t${i}`} x={x(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.month} mo</text>
          ) : null
        )}
      </svg>
    </div>
  );
}
