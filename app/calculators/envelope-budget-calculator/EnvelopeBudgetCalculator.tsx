"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeEnvelopeBudget,
  formatUSD,
  formatCompact,
  type EnvelopeBudgetResult,
} from "@/lib/calculators/envelope-budget";

type Row = { name: string; amount: string };

type FormState = {
  monthlyIncome: string;
  rows: Row[];
};

const DEFAULTS: FormState = {
  monthlyIncome: "4500",
  rows: [
    { name: "Rent / Housing", amount: "1400" },
    { name: "Groceries", amount: "500" },
    { name: "Transport", amount: "300" },
    { name: "Utilities", amount: "220" },
    { name: "Savings", amount: "600" },
    { name: "Fun & Dining", amount: "350" },
  ],
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

// Deterministic palette so colors never shift between server and client.
const PALETTE = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#f59e0b",
  "#facc15",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
];

function compute(f: FormState): EnvelopeBudgetResult | null {
  return computeEnvelopeBudget({
    monthlyIncome: num(f.monthlyIncome) || 0,
    envelopes: f.rows.map((r) => ({ name: r.name, amount: num(r.amount) || 0 })),
  });
}

export default function EnvelopeBudgetCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EnvelopeBudgetResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setIncome(v: string) {
    setForm((f) => ({ ...f, monthlyIncome: v }));
  }
  function setRow(i: number, key: keyof Row, v: string) {
    setForm((f) => {
      const rows = f.rows.slice();
      rows[i] = { ...rows[i], [key]: v };
      return { ...f, rows };
    });
  }
  function addRow() {
    setForm((f) => ({ ...f, rows: [...f.rows, { name: "", amount: "" }] }));
  }
  function removeRow(i: number) {
    setForm((f) => ({ ...f, rows: f.rows.filter((_, idx) => idx !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a monthly income above 0 and at least one envelope with an amount.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your envelopes</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set your take-home pay, then fund each envelope.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Monthly take-home income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyIncome} onChange={(e) => setIncome(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              {form.rows.map((row, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    {i === 0 && <Label htmlFor={`name-${i}`}>Envelope</Label>}
                    <Input id={`name-${i}`} type="text" placeholder="Name" className="h-11" value={row.name} onChange={(e) => setRow(i, "name", e.target.value)} />
                  </div>
                  <div className="w-32">
                    {i === 0 && <Label htmlFor={`amt-${i}`}>Amount</Label>}
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={`amt-${i}`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={row.amount} onChange={(e) => setRow(i, "amount", e.target.value)} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeRow(i)} aria-label="Remove envelope" className="mb-0.5 flex h-11 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-rose-200 hover:text-rose-500">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
              <Plus className="size-4" /> Add envelope
            </button>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {result && result.overspent ? "Over budget by" : "Left to allocate"}
          </p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result && result.overspent ? "text-rose-600" : "text-zinc-900"}`}>
            {result ? formatUSD(Math.abs(result.remaining)) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Income</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.income)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Allocated</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.allocated)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Share allocated</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.allocatedPct.toFixed(0)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.slices.length > 0 && <EnvelopeChart result={result} />}
    </div>
  );
}

function EnvelopeChart({ result }: { result: EnvelopeBudgetResult }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 90;
  const stroke = 34;
  const circ = 2 * Math.PI * radius;

  // Cap the unallocated remainder as a slice too, so the ring shows the whole income.
  const slices = result.slices.map((s, i) => ({
    ...s,
    color: PALETTE[i % PALETTE.length],
  }));
  const remaining = result.remaining > 0 ? result.remaining : 0;
  const denom = Math.max(result.income, result.allocated);

  let offset = 0;
  const arcs = slices.map((s) => {
    const frac = denom > 0 ? s.amount / denom : 0;
    const len = frac * circ;
    const arc = { ...s, len, offset };
    offset += len;
    return arc;
  });
  const remainingFrac = denom > 0 ? remaining / denom : 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where the money goes</h3>
        <span className="text-xs text-zinc-500">{formatCompact(result.allocated)} of {formatCompact(result.income)}</span>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label="Budget allocation donut chart">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.len.toFixed(2)} ${(circ - a.len).toFixed(2)}`}
              strokeDashoffset={(-a.offset).toFixed(2)}
            />
          ))}
        </svg>
        <ul className="grid flex-1 grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
          {arcs.map((a, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 text-zinc-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="truncate">{a.name}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-zinc-900">{(a.share * 100).toFixed(0)}%</span>
            </li>
          ))}
          {remainingFrac > 0 && (
            <li className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 text-zinc-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-200" />
                <span className="truncate">Unallocated</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-zinc-900">{(remainingFrac * 100).toFixed(0)}%</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
