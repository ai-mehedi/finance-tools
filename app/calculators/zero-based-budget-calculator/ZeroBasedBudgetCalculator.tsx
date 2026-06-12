"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeZeroBasedBudget,
  formatUSD,
  formatPct,
  type ZeroBasedBudgetResult,
} from "@/lib/calculators/zero-based-budget";

type CatRow = { name: string; amount: string };

const DEFAULT_INCOME = "5000";

const DEFAULT_CATS: CatRow[] = [
  { name: "Rent / Housing", amount: "1500" },
  { name: "Groceries", amount: "600" },
  { name: "Transportation", amount: "350" },
  { name: "Utilities", amount: "250" },
  { name: "Savings", amount: "800" },
  { name: "Debt repayment", amount: "500" },
  { name: "Fun & dining", amount: "400" },
  { name: "Everything else", amount: "600" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(income: string, cats: CatRow[]): ZeroBasedBudgetResult | null {
  return computeZeroBasedBudget({
    monthlyIncome: num(income) || 0,
    categories: cats.map((c) => ({ name: c.name, amount: num(c.amount) || 0 })),
  });
}

const PALETTE = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#34d399", "#38bdf8", "#a78bfa", "#f472b6", "#a3a3a3", "#71717a"];

export default function ZeroBasedBudgetCalculator() {
  const [income, setIncome] = useState<string>(DEFAULT_INCOME);
  const [cats, setCats] = useState<CatRow[]>(DEFAULT_CATS);
  const [result, setResult] = useState<ZeroBasedBudgetResult | null>(() => compute(DEFAULT_INCOME, DEFAULT_CATS));
  const [error, setError] = useState<string | null>(null);

  function setCat(i: number, patch: Partial<CatRow>) {
    setCats((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function addCat() {
    setCats((cs) => [...cs, { name: "", amount: "" }]);
  }

  function removeCat(i: number) {
    setCats((cs) => (cs.length <= 1 ? cs : cs.filter((_, idx) => idx !== i)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(income, cats);
    if (!r) {
      setError("Enter a non-negative monthly income and at least one category with a positive amount.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setIncome(DEFAULT_INCOME);
    setCats(DEFAULT_CATS);
    setResult(compute(DEFAULT_INCOME, DEFAULT_CATS));
    setError(null);
  }

  const statusMeta = result
    ? result.status === "balanced"
      ? { label: "Every dollar assigned", tone: "text-emerald-600", chip: "bg-emerald-50 text-emerald-700" }
      : result.status === "under"
      ? { label: "Unassigned money left", tone: "text-orange-600", chip: "bg-orange-50 text-orange-700" }
      : { label: "Over budget", tone: "text-rose-600", chip: "bg-rose-50 text-rose-700" }
    : null;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Income & categories</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Give every dollar a job until the leftover hits zero.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Monthly take-home income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input
                  id="income"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="h-11 pl-7"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <Label className="mb-0">Category</Label>
                <Label className="mb-0">Amount</Label>
                <span className="w-9" />
              </div>

              {cats.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                  <Input
                    type="text"
                    className="h-11"
                    value={c.name}
                    placeholder="Category"
                    onChange={(e) => setCat(i, { name: e.target.value })}
                    aria-label={`Category ${i + 1} name`}
                  />
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      className="h-11 pl-7"
                      value={c.amount}
                      onChange={(e) => setCat(i, { amount: e.target.value })}
                      aria-label={`Category ${i + 1} amount`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCat(i)}
                    disabled={cats.length <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remove category ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCat}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
              >
                <Plus className="size-4" /> Add category
              </button>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Left to assign</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result && result.status === "over" ? "text-rose-600" : "text-zinc-900"}`}>
            {result ? formatUSD(result.remaining) : "—"}
          </p>
          {statusMeta && (
            <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${statusMeta.chip}`}>{statusMeta.label}</span>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Monthly income</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.income)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total assigned</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.allocated)}</span>
                </div>
                {result.largestCategory && (
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Biggest category</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">
                      {result.largestCategory.name} ({formatPct(result.largestCategory.share)})
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter income and categories to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Allocation chart */}
      {result && result.slices.length > 0 && <BudgetChart result={result} />}
    </div>
  );
}

function BudgetChart({ result }: { result: ZeroBasedBudgetResult }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 100;
  const rInner = 62;

  const slices = result.slices;
  const total = slices.reduce((s, c) => s + c.amount, 0) || 1;

  let angle = -Math.PI / 2; // start at top
  const arcs = slices.map((s, i) => {
    const frac = s.amount / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + rOuter * Math.cos(start);
    const y1 = cy + rOuter * Math.sin(start);
    const x2 = cx + rOuter * Math.cos(end);
    const y2 = cy + rOuter * Math.sin(end);
    const xi1 = cx + rInner * Math.cos(end);
    const yi1 = cy + rInner * Math.sin(end);
    const xi2 = cx + rInner * Math.cos(start);
    const yi2 = cy + rInner * Math.sin(start);
    const d = `M${x1.toFixed(2)},${y1.toFixed(2)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi1.toFixed(2)},${yi1.toFixed(2)} A${rInner},${rInner} 0 ${large} 0 ${xi2.toFixed(2)},${yi2.toFixed(2)} Z`;
    return { d, color: PALETTE[i % PALETTE.length], slice: s };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Where each dollar goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48 shrink-0" role="img" aria-label="Budget allocation donut chart">
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.color} stroke="#ffffff" strokeWidth={1.5} />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900 font-extrabold" fontSize={18}>
            {formatUSD(result.allocated)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            assigned
          </text>
        </svg>

        <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {arcs.map((a, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="truncate">{a.slice.name}</span>
              </span>
              <span className="shrink-0 font-bold tabular-nums text-zinc-900">{formatPct(a.slice.share)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
