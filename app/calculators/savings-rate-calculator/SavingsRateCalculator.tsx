"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeSavingsRate,
  formatUSD,
  type SavingsRateResult,
} from "@/lib/calculators/savings-rate";

type FormState = {
  monthlyIncome: string;
  monthlyExpenses: string;
  extraMonthlySavings: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "5000",
  monthlyExpenses: "3500",
  extraMonthlySavings: "400",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SavingsRateResult | null {
  return computeSavingsRate({
    monthlyIncome: num(f.monthlyIncome),
    monthlyExpenses: num(f.monthlyExpenses) || 0,
    extraMonthlySavings: num(f.extraMonthlySavings) || 0,
  });
}

export default function SavingsRateCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SavingsRateResult | null>(() => compute(DEFAULTS));
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

  const breakdown = result
    ? [
        { label: "Monthly saved", value: result.monthlySavings, color: "bg-orange-500" },
        { label: "Saved per year", value: result.annualSavings, color: "bg-orange-300" },
        { label: "Spending per year", value: result.annualExpenses, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Use monthly figures, then press Calculate.</p>

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
                <Label htmlFor="expenses">Monthly expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyExpenses} onChange={(e) => set("monthlyExpenses", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="extra">Extra saved / month</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="extra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.extraMonthlySavings} onChange={(e) => set("extraMonthlySavings", e.target.value)} />
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400">Extra savings covers money set aside outside your income gap, such as an employer 401(k) match or side income you bank.</p>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Your savings rate</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${result.savingsRatePct.toFixed(1)}%` : "—"}
          </p>
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

      {/* Split donut */}
      {result && <SplitDonut result={result} />}
    </div>
  );
}

function SplitDonut({ result }: { result: SavingsRateResult }) {
  const W = 640;
  const H = 240;
  const cx = 150;
  const cy = H / 2;
  const rOuter = 86;
  const rInner = 56;

  // Clamp to a 0..100 visual split; a negative savings rate shows as all spending.
  const savedPct = Math.max(0, Math.min(100, result.savingsRatePct));
  const spentPct = 100 - savedPct;

  const arc = (startPct: number, endPct: number, r: number) => {
    const a0 = (startPct / 100) * 2 * Math.PI - Math.PI / 2;
    const a1 = (endPct / 100) * 2 * Math.PI - Math.PI / 2;
    return {
      x0: cx + r * Math.cos(a0),
      y0: cy + r * Math.sin(a0),
      x1: cx + r * Math.cos(a1),
      y1: cy + r * Math.sin(a1),
      large: endPct - startPct > 50 ? 1 : 0,
    };
  };

  const seg = (startPct: number, endPct: number, fill: string, key: string) => {
    if (endPct - startPct <= 0) return null;
    const o = arc(startPct, endPct, rOuter);
    const inn = arc(startPct, endPct, rInner);
    const d = [
      `M${o.x0.toFixed(1)},${o.y0.toFixed(1)}`,
      `A${rOuter},${rOuter} 0 ${o.large} 1 ${o.x1.toFixed(1)},${o.y1.toFixed(1)}`,
      `L${inn.x1.toFixed(1)},${inn.y1.toFixed(1)}`,
      `A${rInner},${rInner} 0 ${inn.large} 0 ${inn.x0.toFixed(1)},${inn.y0.toFixed(1)}`,
      "Z",
    ].join(" ");
    return <path key={key} d={d} fill={fill} />;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where your income goes</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Saved</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /> Spent</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Income split between saved and spent">
        {seg(0, spentPct, "#d4d4d8", "spent")}
        {seg(spentPct, 100, "#f97316", "saved")}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={26} fontWeight={800}>{savedPct.toFixed(0)}%</text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={11}>saved</text>

        <g transform={`translate(${cx + rOuter + 40}, ${cy - 36})`}>
          <rect x={0} y={0} width={11} height={11} rx={2} fill="#f97316" />
          <text x={20} y={10} className="fill-zinc-600" fontSize={13}>You save {savedPct.toFixed(1)}% of income</text>
          <rect x={0} y={26} width={11} height={11} rx={2} fill="#d4d4d8" />
          <text x={20} y={36} className="fill-zinc-600" fontSize={13}>You spend {spentPct.toFixed(1)}% of income</text>
          <text x={0} y={66} className="fill-zinc-900" fontSize={13} fontWeight={700}>
            {result.yearsOfExpensesPerYear.toFixed(2)} yr of expenses saved per year
          </text>
        </g>
      </svg>
    </div>
  );
}
