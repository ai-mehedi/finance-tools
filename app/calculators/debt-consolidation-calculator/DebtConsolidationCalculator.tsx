"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeDebtConsolidation,
  formatUSD,
  formatCompact,
  type DebtConsolidationResult,
} from "@/lib/calculators/debt-consolidation";

type DebtRow = { balance: string; rate: string; payment: string };

type FormState = {
  debts: DebtRow[];
  newRate: string;
  newTermMonths: string;
  fees: string;
};

const DEFAULTS: FormState = {
  debts: [
    { balance: "8000", rate: "22", payment: "240" },
    { balance: "5000", rate: "18", payment: "150" },
    { balance: "3000", rate: "15", payment: "90" },
  ],
  newRate: "11",
  newTermMonths: "48",
  fees: "300",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DebtConsolidationResult | null {
  return computeDebtConsolidation({
    debts: f.debts.map((d) => ({
      balance: num(d.balance) || 0,
      annualRatePct: num(d.rate) || 0,
      monthlyPayment: num(d.payment) || 0,
    })),
    newAnnualRatePct: num(f.newRate) || 0,
    newTermMonths: num(f.newTermMonths),
    fees: num(f.fees) || 0,
  });
}

export default function DebtConsolidationCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DebtConsolidationResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof Omit<FormState, "debts">>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setDebt(i: number, k: keyof DebtRow, v: string) {
    setForm((f) => ({
      ...f,
      debts: f.debts.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)),
    }));
  }

  function addDebt() {
    setForm((f) => ({ ...f, debts: [...f.debts, { balance: "", rate: "", payment: "" }] }));
  }

  function removeDebt(i: number) {
    setForm((f) => ({ ...f, debts: f.debts.filter((_, idx) => idx !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError(
        "Check your inputs: each debt needs a balance and a payment large enough to cover its monthly interest, and the new loan needs a positive term."
      );
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
        { label: "New monthly payment", value: result.newMonthlyPayment, color: "bg-orange-500" },
        { label: "Old monthly payment", value: result.currentMonthlyPayment, color: "bg-zinc-300" },
        { label: "Interest if you do nothing", value: result.currentTotalInterest, color: "bg-orange-300" },
        { label: "Interest after consolidating", value: result.newTotalInterest, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your debts</h2>
          <p className="mt-0.5 text-sm text-zinc-500">List each balance, its rate and what you pay monthly.</p>

          <div className="mt-5 space-y-3">
            <div className="hidden grid-cols-12 gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 sm:grid">
              <span className="col-span-4">Balance</span>
              <span className="col-span-3">Rate %</span>
              <span className="col-span-4">Monthly pay</span>
              <span className="col-span-1" />
            </div>
            {form.debts.map((d, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-4">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input aria-label={`Debt ${i + 1} balance`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-6" value={d.balance} onChange={(e) => setDebt(i, "balance", e.target.value)} />
                  </div>
                </div>
                <div className="col-span-3">
                  <Input aria-label={`Debt ${i + 1} rate`} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={d.rate} onChange={(e) => setDebt(i, "rate", e.target.value)} />
                </div>
                <div className="col-span-4">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input aria-label={`Debt ${i + 1} monthly payment`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-6" value={d.payment} onChange={(e) => setDebt(i, "payment", e.target.value)} />
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" aria-label={`Remove debt ${i + 1}`} onClick={() => removeDebt(i)} disabled={form.debts.length <= 1} className="text-zinc-400 transition-colors hover:text-rose-500 disabled:opacity-30">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addDebt} className="mt-1">
              <Plus /> Add a debt
            </Button>

            <div className="mt-4 border-t border-zinc-100 pt-4">
              <h3 className="text-sm font-extrabold text-zinc-900">Consolidation loan</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="newRate">New rate (% / yr)</Label>
                  <Input id="newRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newRate} onChange={(e) => setField("newRate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="newTerm">Term (months)</Label>
                  <Input id="newTerm" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.newTermMonths} onChange={(e) => setField("newTermMonths", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="fees">Fees</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="fees" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-6" value={form.fees} onChange={(e) => setField("fees", e.target.value)} />
                  </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Lifetime interest saved</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.interestSavings) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.monthlySavings >= 0
                ? `${formatUSD(result.monthlySavings)} lower payment each month`
                : `${formatUSD(-result.monthlySavings)} higher payment each month`}
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

function PayoffChart({ result }: { result: DebtConsolidationResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal =
    Math.max(...data.map((p) => Math.max(p.currentBalance, p.consolidatedBalance))) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const curPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.currentBalance).toFixed(1)}`);
  const newPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.consolidatedBalance).toFixed(1)}`);
  const newArea = `M${x(0)},${y(0)} L${newPts.join(" L")} L${x(months)},${y(0)} Z`;
  const curLine = `M${curPts.join(" L")}`;
  const newLine = `M${newPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance owed over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Consolidated</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Keep as-is</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Debt payoff comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="dcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={newArea} fill="url(#dcFill)" />
        <path d={newLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={curLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
