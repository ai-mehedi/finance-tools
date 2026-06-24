"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeLoanComparison,
  formatUSD,
  formatCompact,
  type LoanComparisonResult,
} from "@/lib/calculators/loan-comparison";

type LoanFields = {
  amount: string;
  annualRatePct: string;
  years: string;
  fees: string;
};

type FormState = {
  a: LoanFields;
  b: LoanFields;
};

const DEFAULTS: FormState = {
  a: { amount: "25000", annualRatePct: "6.5", years: "5", fees: "300" },
  b: { amount: "25000", annualRatePct: "5.9", years: "6", fees: "900" },
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function toLoan(f: LoanFields) {
  return {
    amount: num(f.amount),
    annualRatePct: num(f.annualRatePct) || 0,
    years: num(f.years),
    fees: num(f.fees) || 0,
  };
}

function compute(f: FormState): LoanComparisonResult | null {
  return computeLoanComparison({ loanA: toLoan(f.a), loanB: toLoan(f.b) });
}

export default function LoanComparisonCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LoanComparisonResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setField(loan: "a" | "b", k: keyof LoanFields, v: string) {
    setForm((f) => ({ ...f, [loan]: { ...f[loan], [k]: v } }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive amount and term for both loans, and non-negative rates and fees.");
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

  const winnerLabel =
    result && result.cheaper !== "tie"
      ? `Loan ${result.cheaper} costs less overall`
      : "Both loans cost about the same";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {(["a", "b"] as const).map((key) => (
            <div key={key} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-zinc-900">Loan {key.toUpperCase()}</h2>
              <p className="mt-0.5 text-sm text-zinc-500">Enter the offer details.</p>

              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor={`${key}-amount`}>Loan amount</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={`${key}-amount`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[key].amount} onChange={(e) => setField(key, "amount", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`${key}-rate`}>Rate (% / yr)</Label>
                    <Input id={`${key}-rate`} type="number" step="any" inputMode="decimal" className="h-11" value={form[key].annualRatePct} onChange={(e) => setField(key, "annualRatePct", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`${key}-years`}>Term (years)</Label>
                    <Input id={`${key}-years`} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form[key].years} onChange={(e) => setField(key, "years", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`${key}-fees`}>Upfront fees</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={`${key}-fees`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[key].fees} onChange={(e) => setField(key, "fees", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" className="flex-1 sm:flex-none">
            <Calculator /> Compare
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={reset}>
            <RotateCcw /> Reset
          </Button>
        </div>
      </form>

      {/* Results */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Verdict</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
          {result ? winnerLabel : "—"}
        </p>
        {result && result.cheaper !== "tie" && (
          <p className="mt-1 text-sm text-zinc-600">
            Savings over the life of the loan: {formatUSD(Math.abs(result.totalCostDiff))}
          </p>
        )}

        {result ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(["a", "b"] as const).map((key) => {
              const o = result[key];
              const isWinner = result.cheaper === key.toUpperCase();
              return (
                <div key={key} className={`rounded-xl border bg-white/80 p-4 ${isWinner ? "border-orange-400" : "border-zinc-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900">Loan {key.toUpperCase()}</span>
                    {isWinner && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">Cheaper</span>}
                  </div>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums text-zinc-900">{formatUSD(o.monthlyPayment)}<span className="text-sm font-medium text-zinc-400">/mo</span></p>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-zinc-500">Total interest</dt><dd className="font-semibold tabular-nums text-zinc-900">{formatUSD(o.totalInterest)}</dd></div>
                    <div className="flex justify-between"><dt className="text-zinc-500">Total cost (with fees)</dt><dd className="font-semibold tabular-nums text-zinc-900">{formatUSD(o.totalCost)}</dd></div>
                  </dl>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to compare.</p>
        )}
      </div>

      {result && <BalanceChart result={result} />}

      {/* What-if: how Loan A's interest rate changes its monthly payment and total cost. */}
      {result && <RateScenarios form={form} />}
    </div>
  );
}

/** Sweeps Loan A's interest rate so the user sees how the rate they're offered
 *  moves the monthly payment and the true total cost (with fees), keeping every
 *  other Loan A input — and Loan B — fixed. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.a.annualRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([3, 4, 5, 6, 7, 8, base]))
      .filter((r) => Number.isFinite(r) && r >= 0)
      .sort((x, y) => x - y);

    const built = rates.map((rate) => {
      const r = compute({ ...form, a: { ...form.a, annualRatePct: String(rate) } });
      return {
        rate: `${rate}%`,
        monthly: r?.a.monthlyPayment ?? 0,
        totalCost: r?.a.totalCost ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === `${base}%`) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Loan A rate" },
    { key: "monthly", label: "Monthly payment", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "totalCost", label: "Total cost (with fees)", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if Loan A's rate were different?"
      caption="Only Loan A's interest rate changes — every other input stays the same."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="loan-comparison-rate-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: LoanComparisonResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const aData = result.a.schedule;
  const bData = result.b.schedule;
  const maxMonth = Math.max(aData[aData.length - 1].month, bData[bData.length - 1].month) || 1;
  const maxVal = result.maxBalance;

  const x = (m: number) => pad.l + (m / maxMonth) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const line = (d: { month: number; balance: number }[]) =>
    `M${d.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`).join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const yearsMax = Math.round(maxMonth / 12);
  const xTicks = [0, Math.round(yearsMax / 2), yearsMax].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance paid down over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Loan A</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Loan B</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan balance comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <path d={line(bData)} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        <path d={line(aData)} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t * 12)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
