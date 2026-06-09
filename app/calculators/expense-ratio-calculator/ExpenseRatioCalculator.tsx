"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeExpenseRatio,
  formatUSD,
  formatCompact,
  type ExpenseRatioResult,
} from "@/lib/calculators/expense-ratio";

type FormState = {
  initial: string;
  annualContribution: string;
  annualReturnPct: string;
  expenseRatioPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  initial: "50000",
  annualContribution: "6000",
  annualReturnPct: "7",
  expenseRatioPct: "0.75",
  years: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ExpenseRatioResult | null {
  return computeExpenseRatio({
    initial: num(f.initial) || 0,
    annualContribution: num(f.annualContribution) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    expenseRatioPct: num(f.expenseRatioPct) || 0,
    years: num(f.years),
  });
}

export default function ExpenseRatioCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ExpenseRatioResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a number of years greater than 0 and non-negative amounts.");
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
        { label: "Balance after fees", value: result.finalWithFee, color: "bg-orange-500" },
        { label: "Balance with no fee", value: result.finalWithoutFee, color: "bg-zinc-300" },
        { label: "Total lost to fees", value: result.lostGrowth, color: "bg-amber-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Fund details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="initial">Amount invested</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="initial" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initial} onChange={(e) => set("initial", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="contrib">Added per year</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualContribution} onChange={(e) => set("annualContribution", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="return">Return (% / yr)</Label>
                <Input id="return" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualReturnPct} onChange={(e) => set("annualReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="er">Expense ratio (%)</Label>
                <Input id="er" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.expenseRatioPct} onChange={(e) => set("expenseRatioPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total cost of the fee</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.lostGrowth) : "—"}
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
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              You pay about <span className="font-semibold text-zinc-600">{formatUSD(result.firstYearFee)}</span> in fees the first year. Over time the drag compounds into{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.totalFees)}</span> of fees paid.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <GapChart result={result} />}
    </div>
  );
}

function GapChart({ result }: { result: ExpenseRatioResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.withoutFee)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const grossPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.withoutFee).toFixed(1)}`);
  const netPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.withFee).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${netPts.join(" L")} L${x(years)},${y(0)} Z`;
  const grossLine = `M${grossPts.join(" L")}`;
  const netLine = `M${netPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Fee drag over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> No fee</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> After fee</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Expense ratio fee drag chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="erFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#erFill)" />
        <path d={netLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={grossLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
