"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeMonthlyExpense,
  formatUSD,
  type MonthlyExpenseResult,
  type ExpenseSlice,
} from "@/lib/calculators/monthly-expense";

type FormState = {
  monthlyIncome: string;
  housing: string;
  utilities: string;
  food: string;
  transport: string;
  insurance: string;
  debt: string;
  entertainment: string;
  other: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "5000",
  housing: "1500",
  utilities: "250",
  food: "600",
  transport: "400",
  insurance: "300",
  debt: "350",
  entertainment: "250",
  other: "200",
};

const EXPENSE_FIELDS: { key: keyof Omit<FormState, "monthlyIncome">; label: string }[] = [
  { key: "housing", label: "Housing / rent" },
  { key: "utilities", label: "Utilities" },
  { key: "food", label: "Food & groceries" },
  { key: "transport", label: "Transport" },
  { key: "insurance", label: "Insurance" },
  { key: "debt", label: "Debt payments" },
  { key: "entertainment", label: "Entertainment" },
  { key: "other", label: "Other" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MonthlyExpenseResult | null {
  return computeMonthlyExpense({
    monthlyIncome: num(f.monthlyIncome) || 0,
    housing: num(f.housing) || 0,
    utilities: num(f.utilities) || 0,
    food: num(f.food) || 0,
    transport: num(f.transport) || 0,
    insurance: num(f.insurance) || 0,
    debt: num(f.debt) || 0,
    entertainment: num(f.entertainment) || 0,
    other: num(f.other) || 0,
  });
}

export default function MonthlyExpenseCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MonthlyExpenseResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative numbers for income and every expense category.");
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

  const surplus = result ? result.leftover >= 0 : true;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Monthly budget</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your take-home pay and spending, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Monthly take-home income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={field.key} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[field.key]} onChange={(e) => set(field.key, e.target.value)} />
                  </div>
                </div>
              ))}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total monthly expenses</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalExpenses) : "—"}
          </p>
          {result ? (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Monthly income</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">{surplus ? "Left over" : "Shortfall"}</span>
                <span className={`text-sm font-bold tabular-nums ${surplus ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatUSD(Math.abs(result.leftover))}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Savings rate</span>
                <span className={`text-sm font-bold tabular-nums ${result.savingsRatePct >= 0 ? "text-zinc-900" : "text-rose-600"}`}>
                  {result.savingsRatePct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Annual spending</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualExpenses)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </form>

      {/* Category donut */}
      {result && result.slices.length > 0 && <CategoryDonut result={result} />}
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toXY = (angle: number) => {
    const a = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const start = toXY(endAngle);
  const end = toXY(startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function CategoryDonut({ result }: { result: MonthlyExpenseResult }) {
  const slices: ExpenseSlice[] = result.slices;
  const cx = 90;
  const cy = 90;
  const r = 66;
  const stroke = 26;

  let cursor = 0;
  const arcs = slices.map((s) => {
    const start = cursor * 360;
    const end = (cursor + s.share) * 360;
    cursor += s.share;
    return { slice: s, d: describeArc(cx, cy, r, start, end) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the money goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="Expense category breakdown">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a) => (
            <path key={a.slice.key} d={a.d} fill="none" stroke={a.slice.color} strokeWidth={stroke} strokeLinecap="butt" />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={15} fontWeight={800}>
            {formatUSD(result.totalExpenses)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={9}>
            per month
          </text>
        </svg>
        <ul className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
          {slices.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">{(s.share * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
