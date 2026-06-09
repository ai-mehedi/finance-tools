"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeExpenseTracker,
  formatUSD2,
  formatCompact,
  EXPENSE_CATEGORIES,
  type ExpenseEntry,
  type ExpenseTrackerResult,
} from "@/lib/calculators/expense-tracker";

type Row = { id: string; label: string; category: string; amount: string };

let nextId = 0;
const makeId = () => `row-${nextId++}`;

const DEFAULT_ROWS: Row[] = [
  { id: makeId(), label: "Rent", category: "Housing", amount: "1500" },
  { id: makeId(), label: "Groceries", category: "Food", amount: "600" },
  { id: makeId(), label: "Car payment", category: "Transport", amount: "350" },
  { id: makeId(), label: "Electric & water", category: "Utilities", amount: "180" },
  { id: makeId(), label: "Streaming", category: "Entertainment", amount: "45" },
];

const DEFAULT_INCOME = "4200";

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function toEntries(rows: Row[]): ExpenseEntry[] {
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    category: r.category,
    amount: num(r.amount) || 0,
  }));
}

function compute(rows: Row[], income: string): ExpenseTrackerResult {
  return computeExpenseTracker(toEntries(rows), num(income) || 0);
}

export default function ExpenseTrackerCalculator() {
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [income, setIncome] = useState<string>(DEFAULT_INCOME);
  const [result, setResult] = useState<ExpenseTrackerResult>(() => compute(DEFAULT_ROWS, DEFAULT_INCOME));

  function setRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { id: makeId(), label: "", category: "Other", amount: "" }]);
  }

  function removeRow(id: string) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(compute(rows, income));
  }

  function reset() {
    const fresh = DEFAULT_ROWS.map((r) => ({ ...r, id: makeId() }));
    setRows(fresh);
    setIncome(DEFAULT_INCOME);
    setResult(compute(fresh, DEFAULT_INCOME));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your expenses</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Add your monthly expenses, then press Calculate.</p>

          <div className="mt-5">
            <Label htmlFor="income">Monthly income (optional)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={income} onChange={(e) => setIncome(e.target.value)} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Input aria-label="Expense name" placeholder="Expense" className="h-11" value={r.label} onChange={(e) => setRow(r.id, { label: e.target.value })} />
                </div>
                <div className="col-span-3">
                  <Select aria-label="Category" className="h-11" value={r.category} onChange={(e) => setRow(r.id, { category: e.target.value })}>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input aria-label="Amount" type="number" min={0} step="any" inputMode="decimal" placeholder="0" className="h-11 pl-6" value={r.amount} onChange={(e) => setRow(r.id, { amount: e.target.value })} />
                  </div>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button type="button" onClick={() => removeRow(r.id)} aria-label="Remove expense" className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addRow} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
            <Plus className="size-4" /> Add expense
          </button>

          <div className="mt-5 flex gap-3 pt-1">
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total monthly spending</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {formatUSD2(result.totalSpending)}
          </p>
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
              <span className="text-sm font-medium text-zinc-500">Yearly spending</span>
              <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.totalSpending * 12)}</span>
            </div>
            {result.income > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Left after expenses</span>
                <span className={`text-sm font-bold tabular-nums ${result.remaining < 0 ? "text-rose-500" : "text-zinc-900"}`}>{formatUSD2(result.remaining)}</span>
              </div>
            )}
            {result.largestCategory && (
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Biggest category</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.largestCategory.category}</span>
              </div>
            )}
          </div>
          {result.income > 0 && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              You are spending <span className="font-semibold text-zinc-600">{result.spentPct.toFixed(0)}%</span> of your monthly income.
            </p>
          )}
        </div>
      </form>

      {result.byCategory.length > 0 && <CategoryChart result={result} />}
    </div>
  );
}

function CategoryChart({ result }: { result: ExpenseTrackerResult }) {
  const max = result.byCategory[0]?.amount || 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Spending by category</h3>
      <div className="space-y-3">
        {result.byCategory.map((c) => (
          <div key={c.category}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700">{c.category}</span>
              <span className="tabular-nums text-zinc-500">{formatCompact(c.amount)} · {c.share.toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${(c.amount / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
