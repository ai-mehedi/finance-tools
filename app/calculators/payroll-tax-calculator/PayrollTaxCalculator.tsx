"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computePayrollTax,
  formatUSD,
  formatCompact,
  type PayrollTaxResult,
} from "@/lib/calculators/payroll-tax";

type FormState = {
  annualWages: string;
};

const DEFAULTS: FormState = {
  annualWages: "90000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PayrollTaxResult | null {
  return computePayrollTax({ annualWages: num(f.annualWages) });
}

export default function PayrollTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PayrollTaxResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter annual wages greater than 0.");
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

  const summary = result
    ? [
        { label: "Employer share", value: result.employerTotal, color: "bg-orange-300" },
        { label: "Combined FICA", value: result.combinedTotal, color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter gross annual wages, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="wages">Annual gross wages</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="wages" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualWages} onChange={(e) => set("annualWages", e.target.value)} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Social Security applies up to a $168,600 wage base. An extra 0.9% Medicare surtax applies to your wages above $200,000.
              </p>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Your payroll tax (employee)</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.employeeTotal) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Combined effective rate {result.effectiveRatePct.toFixed(2)}%
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              summary.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid wages to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Employee vs employer chart */}
      {result && <PayrollChart result={result} />}
    </div>
  );
}

function PayrollChart({ result }: { result: PayrollTaxResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 56, r: 16, t: 16, b: 40 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const groups = result.lines;
  const maxVal = Math.max(...groups.map((g) => Math.max(g.employee, g.employer)), 1);

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;
  const groupW = innerW / groups.length;
  const barW = Math.min(38, groupW / 3);
  const gap = 8;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const baseY = y(0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Who pays what</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Employee</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-300" /> Employer</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Employee versus employer payroll tax chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {groups.map((g, i) => {
          const centerX = pad.l + groupW * i + groupW / 2;
          const empX = centerX - barW - gap / 2;
          const emprX = centerX + gap / 2;
          return (
            <g key={g.label}>
              <rect x={empX} y={y(g.employee)} width={barW} height={Math.max(0, baseY - y(g.employee))} rx={3} fill="#f97316" />
              <rect x={emprX} y={y(g.employer)} width={barW} height={Math.max(0, baseY - y(g.employer))} rx={3} fill="#fdba74" />
              <text x={centerX} y={H - 14} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{g.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
