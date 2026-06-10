"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeIncomeVsExpense,
  formatUSD,
  formatCompact,
  type IncomeVsExpenseResult,
} from "@/lib/calculators/income-vs-expense";

type FormState = {
  monthlyIncome: string;
  housing: string;
  transport: string;
  food: string;
  other: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "5000",
  housing: "1500",
  transport: "500",
  food: "600",
  other: "900",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): IncomeVsExpenseResult | null {
  return computeIncomeVsExpense({
    monthlyIncome: num(f.monthlyIncome),
    housing: num(f.housing) || 0,
    transport: num(f.transport) || 0,
    food: num(f.food) || 0,
    other: num(f.other) || 0,
  });
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function IncomeVsExpenseCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<IncomeVsExpenseResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a monthly income greater than 0 and non-negative expenses.");
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

  const surplus = result ? result.net >= 0 : false;
  const breakdown = result
    ? [
        { label: "Total income", value: result.totalIncome, color: "bg-orange-300" },
        { label: "Total expenses", value: result.totalExpenses, color: "bg-zinc-300" },
        { label: surplus ? "Monthly surplus" : "Monthly deficit", value: Math.abs(result.net), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your monthly budget</h2>
          <p className="mt-0.5 text-sm text-zinc-500">All figures are per month. Press Calculate when ready.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Monthly income (take-home)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="housing">Housing</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="housing" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.housing} onChange={(e) => set("housing", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="transport">Transport</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="transport" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.transport} onChange={(e) => set("transport", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="food">Food</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="food" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.food} onChange={(e) => set("food", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="other">Other</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="other" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.other} onChange={(e) => set("other", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{surplus ? "Monthly surplus" : "Monthly deficit"}</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result && !surplus ? "text-rose-600" : "text-zinc-900"}`}>
            {result ? formatUSD(Math.abs(result.net)) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Savings rate {pct(result.savingsRate)} · {formatUSD(result.annualNet)} / year
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

      {/* Expense donut + savings projection */}
      {result && result.totalExpenses > 0 && <ExpenseDonut result={result} />}
    </div>
  );
}

const DONUT_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

function ExpenseDonut({ result }: { result: IncomeVsExpenseResult }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const stroke = 26;
  const circ = 2 * Math.PI * r;

  const segments = result.shares.filter((s) => s.value > 0);
  let offset = 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the money goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0" role="img" aria-label="Expense breakdown donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {segments.map((s, i) => {
            const len = s.share * circ;
            const dash = `${len} ${circ - len}`;
            const el = (
              <circle
                key={s.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += len;
            return el;
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={15} fontWeight={800}>
            {formatCompact(result.totalExpenses)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            total / mo
          </text>
        </svg>
        <ul className="w-full space-y-2">
          {segments.map((s, i) => (
            <li key={s.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">
                {formatUSD(s.value)} <span className="font-normal text-zinc-400">({(s.share * 100).toFixed(0)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
