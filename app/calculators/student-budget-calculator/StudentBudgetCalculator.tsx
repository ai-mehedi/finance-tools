"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeStudentBudget,
  formatUSD,
  type StudentBudgetResult,
} from "@/lib/calculators/student-budget";

type FormState = {
  jobIncome: string;
  aidIncome: string;
  familySupport: string;
  otherIncome: string;
  housing: string;
  food: string;
  transport: string;
  tuitionSetAside: string;
  booksSupplies: string;
  phoneInternet: string;
  funMisc: string;
  otherExpense: string;
};

const DEFAULTS: FormState = {
  jobIncome: "700",
  aidIncome: "900",
  familySupport: "300",
  otherIncome: "0",
  housing: "650",
  food: "300",
  transport: "120",
  tuitionSetAside: "400",
  booksSupplies: "80",
  phoneInternet: "60",
  funMisc: "150",
  otherExpense: "50",
};

const num = (s: string) => (s.trim() === "" ? 0 : Number(s));

function compute(f: FormState): StudentBudgetResult | null {
  return computeStudentBudget({
    jobIncome: num(f.jobIncome),
    aidIncome: num(f.aidIncome),
    familySupport: num(f.familySupport),
    otherIncome: num(f.otherIncome),
    housing: num(f.housing),
    food: num(f.food),
    transport: num(f.transport),
    tuitionSetAside: num(f.tuitionSetAside),
    booksSupplies: num(f.booksSupplies),
    phoneInternet: num(f.phoneInternet),
    funMisc: num(f.funMisc),
    otherExpense: num(f.otherExpense),
  });
}

const INCOME_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "jobIncome", label: "Job / work income" },
  { key: "aidIncome", label: "Financial aid (monthly)" },
  { key: "familySupport", label: "Family support" },
  { key: "otherIncome", label: "Other income" },
];

const EXPENSE_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "housing", label: "Housing / rent" },
  { key: "food", label: "Food & groceries" },
  { key: "transport", label: "Transport" },
  { key: "tuitionSetAside", label: "Tuition / fees" },
  { key: "booksSupplies", label: "Books & supplies" },
  { key: "phoneInternet", label: "Phone & internet" },
  { key: "funMisc", label: "Fun & misc" },
  { key: "otherExpense", label: "Other" },
];

export default function StudentBudgetCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<StudentBudgetResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative amounts and at least one income or expense above zero.");
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

  const surplus = result ? result.net >= 0 : true;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your monthly numbers</h2>
          <p className="mt-0.5 text-sm text-zinc-500">All amounts are per month. Press Calculate when done.</p>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Money coming in</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {INCOME_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={f.key} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Money going out</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {EXPENSE_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={f.key} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-medium text-rose-500">{error}</p>}

          <div className="mt-5 flex gap-3">
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              <Calculator /> Calculate
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={reset}>
              <RotateCcw /> Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {surplus ? "Monthly surplus" : "Monthly shortfall"}
          </p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result && !surplus ? "text-rose-600" : "text-zinc-900"}`}>
            {result ? formatUSD(Math.abs(result.net)) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total income</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalIncome)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total expenses</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Savings rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.savingsRatePct.toFixed(1)}%</span>
                </div>
                {result.topExpense && (
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Biggest cost</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{result.topExpense.label}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Donut chart */}
      {result && result.expenseCategories.length > 0 && <ExpenseDonut result={result} />}
    </div>
  );
}

function ExpenseDonut({ result }: { result: StudentBudgetResult }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 78;
  const stroke = 26;
  const circumference = 2 * Math.PI * radius;
  const total = result.totalExpenses || 1;

  let offset = 0;
  const arcs = result.expenseCategories.map((c) => {
    const frac = c.value / total;
    const dash = frac * circumference;
    const seg = { ...c, frac, dash, dashOffset: offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the money goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label="Student expense breakdown donut chart">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.dash.toFixed(2)} ${(circumference - a.dash).toFixed(2)}`}
              strokeDashoffset={(-a.dashOffset).toFixed(2)}
            />
          ))}
        </svg>
        <ul className="grid flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2">
          {arcs.map((a) => (
            <li key={a.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                {a.label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">{Math.round(a.frac * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
