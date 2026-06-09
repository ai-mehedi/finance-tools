"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCashFlow,
  formatUSD,
  formatUSD2,
  formatCompact,
  type CashFlowResult,
} from "@/lib/calculators/cash-flow";

type FormState = {
  salary: string;
  otherIncome: string;
  housing: string;
  transport: string;
  food: string;
  debtPayments: string;
  otherExpenses: string;
  projectionYears: string;
};

const DEFAULTS: FormState = {
  salary: "5000",
  otherIncome: "500",
  housing: "1600",
  transport: "500",
  food: "700",
  debtPayments: "400",
  otherExpenses: "800",
  projectionYears: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CashFlowResult | null {
  return computeCashFlow({
    salary: num(f.salary) || 0,
    otherIncome: num(f.otherIncome) || 0,
    housing: num(f.housing) || 0,
    transport: num(f.transport) || 0,
    food: num(f.food) || 0,
    debtPayments: num(f.debtPayments) || 0,
    otherExpenses: num(f.otherExpenses) || 0,
    projectionYears: num(f.projectionYears),
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

export default function CashFlowCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CashFlowResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative amounts and a projection of at least 1 year.");
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

  const positive = result ? result.netCashFlow >= 0 : true;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Monthly income and expenses</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in your monthly numbers, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Income</p>
            <div className="grid grid-cols-2 gap-3">
              <Money id="salary" label="Take home pay" value={form.salary} onChange={(v) => set("salary", v)} />
              <Money id="otherIncome" label="Other income" value={form.otherIncome} onChange={(v) => set("otherIncome", v)} />
            </div>

            <p className="pt-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Expenses</p>
            <div className="grid grid-cols-2 gap-3">
              <Money id="housing" label="Housing" value={form.housing} onChange={(v) => set("housing", v)} />
              <Money id="transport" label="Transport" value={form.transport} onChange={(v) => set("transport", v)} />
              <Money id="food" label="Food" value={form.food} onChange={(v) => set("food", v)} />
              <Money id="debtPayments" label="Debt payments" value={form.debtPayments} onChange={(v) => set("debtPayments", v)} />
              <Money id="otherExpenses" label="Other expenses" value={form.otherExpenses} onChange={(v) => set("otherExpenses", v)} />
              <div>
                <Label htmlFor="projectionYears">Projection (years)</Label>
                <Input id="projectionYears" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.projectionYears} onChange={(e) => set("projectionYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net monthly cash flow</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${positive ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? formatUSD2(result.netCashFlow) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total income</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.totalIncome)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total expenses</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Savings rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.savingsRatePct.toFixed(1)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              That is{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.annualNet)}</span> a year you could save or invest.
            </p>
          )}
        </div>
      </form>

      {result && result.netCashFlow !== 0 && result.schedule.length > 1 && <BalanceChart result={result} />}
    </div>
  );
}

function BalanceChart({ result }: { result: CashFlowResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.abs(p.balance))) || 1;

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
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Cumulative cash flow over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative cash flow chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="cfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#cfFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
