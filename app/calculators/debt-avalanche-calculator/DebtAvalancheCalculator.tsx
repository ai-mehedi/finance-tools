"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeDebtAvalanche,
  formatUSD,
  formatCompact,
  formatMonths,
  type DebtAvalancheResult,
} from "@/lib/calculators/debt-avalanche";

type DebtRow = {
  name: string;
  balance: string;
  rate: string;
  min: string;
};

type FormState = {
  debts: DebtRow[];
  extra: string;
};

const DEFAULTS: FormState = {
  debts: [
    { name: "Credit card", balance: "8000", rate: "22", min: "200" },
    { name: "Car loan", balance: "12000", rate: "7", min: "320" },
    { name: "Student loan", balance: "15000", rate: "5", min: "180" },
  ],
  extra: "300",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DebtAvalancheResult | null {
  return computeDebtAvalanche({
    debts: f.debts.map((d) => ({
      name: d.name.trim() || "Debt",
      balance: num(d.balance) || 0,
      annualRatePct: num(d.rate) || 0,
      minPayment: num(d.min) || 0,
    })),
    extraPayment: num(f.extra) || 0,
  });
}

export default function DebtAvalancheCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DebtAvalancheResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setDebt(i: number, k: keyof DebtRow, v: string) {
    setForm((f) => {
      const debts = f.debts.map((d, idx) => (idx === i ? { ...d, [k]: v } : d));
      return { ...f, debts };
    });
  }

  function addDebt() {
    setForm((f) => ({ ...f, debts: [...f.debts, { name: "", balance: "", rate: "", min: "" }] }));
  }

  function removeDebt(i: number) {
    setForm((f) => ({ ...f, debts: f.debts.filter((_, idx) => idx !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Add at least one debt with a balance, and make sure your minimums plus extra cover the monthly interest.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your debts</h2>
          <p className="mt-0.5 text-sm text-zinc-500">List each balance, rate and minimum. Highest rate is paid first.</p>

          <div className="mt-5 space-y-4">
            <div className="hidden grid-cols-12 gap-2 px-1 text-xs font-semibold text-zinc-400 sm:grid">
              <span className="col-span-4">Name</span>
              <span className="col-span-3">Balance</span>
              <span className="col-span-2">Rate %</span>
              <span className="col-span-2">Min</span>
              <span className="col-span-1" />
            </div>

            {form.debts.map((d, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <Input className="col-span-12 h-10 sm:col-span-4" placeholder="Debt name" value={d.name} onChange={(e) => setDebt(i, "name", e.target.value)} />
                <Input className="col-span-4 h-10 sm:col-span-3" type="number" min={0} step="any" inputMode="decimal" placeholder="Balance" value={d.balance} onChange={(e) => setDebt(i, "balance", e.target.value)} />
                <Input className="col-span-3 h-10 sm:col-span-2" type="number" min={0} step="any" inputMode="decimal" placeholder="Rate" value={d.rate} onChange={(e) => setDebt(i, "rate", e.target.value)} />
                <Input className="col-span-3 h-10 sm:col-span-2" type="number" min={0} step="any" inputMode="decimal" placeholder="Min" value={d.min} onChange={(e) => setDebt(i, "min", e.target.value)} />
                <button type="button" onClick={() => removeDebt(i)} aria-label="Remove debt" className="col-span-2 flex h-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 sm:col-span-1">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            <button type="button" onClick={addDebt} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:border-orange-300 hover:text-orange-600">
              <Plus className="size-4" /> Add a debt
            </button>

            <div>
              <Label htmlFor="extra">Extra monthly payment</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="extra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.extra} onChange={(e) => setForm((f) => ({ ...f, extra: e.target.value }))} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Debt-free in</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatMonths(result.months) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-bold text-orange-600">{result.months} payments total</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Starting balance</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.startingBalance)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total paid</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPaid)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid debts to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Payoff order */}
      {result && result.perDebt.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Payoff order (highest rate first)</h3>
          <div className="space-y-2">
            {[...result.perDebt]
              .sort((a, b) => a.payoffMonth - b.payoffMonth)
              .map((d) => (
                <div key={d.name} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
                  <span className="text-sm font-semibold text-zinc-700">{d.name}</span>
                  <span className="flex items-center gap-4 text-xs tabular-nums text-zinc-500">
                    <span>Gone by {formatMonths(d.payoffMonth)}</span>
                    <span className="font-bold text-zinc-900">{formatUSD(d.interestPaid)} interest</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Balance chart */}
      {result && result.schedule.length > 1 && <PayoffChart result={result} />}
    </div>
  );
}

function PayoffChart({ result }: { result: DebtAvalancheResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(months)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Total debt</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Debt balance over time chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="avFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#avFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
