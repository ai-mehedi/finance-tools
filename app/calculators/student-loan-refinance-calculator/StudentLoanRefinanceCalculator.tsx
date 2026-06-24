"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeStudentLoanRefinance,
  formatUSD,
  formatCompact,
  type RefinanceResult,
} from "@/lib/calculators/student-loan-refinance";

type FormState = {
  balance: string;
  currentRatePct: string;
  monthsRemaining: string;
  newRatePct: string;
  newTermMonths: string;
};

const DEFAULTS: FormState = {
  balance: "40000",
  currentRatePct: "7.5",
  monthsRemaining: "108",
  newRatePct: "5.25",
  newTermMonths: "120",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RefinanceResult | null {
  return computeStudentLoanRefinance({
    balance: num(f.balance),
    currentRatePct: num(f.currentRatePct) || 0,
    monthsRemaining: num(f.monthsRemaining),
    newRatePct: num(f.newRatePct) || 0,
    newTermMonths: num(f.newTermMonths),
  });
}

export default function StudentLoanRefinanceCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a positive balance, both rates, months remaining and a new term greater than 0."
      : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const saves = result ? result.lifetimeSavings >= 0 : false;

  const breakdown = result
    ? [
        { label: "Current payment", value: formatUSD(result.currentPayment), color: "bg-zinc-300" },
        { label: "New payment", value: formatUSD(result.newPayment), color: "bg-orange-300" },
        { label: "Current total interest", value: formatUSD(result.currentTotalInterest), color: "bg-zinc-400" },
        { label: "New total interest", value: formatUSD(result.newTotalInterest), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your loans</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Compare your current loan with a refinance offer.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="balance">Remaining balance</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curRate">Current rate (% / yr)</Label>
                <Input id="curRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentRatePct} onChange={(e) => set("currentRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="curMonths">Months left</Label>
                <Input id="curMonths" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.monthsRemaining} onChange={(e) => set("monthsRemaining", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="newRate">New rate (% / yr)</Label>
                <Input id="newRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newRatePct} onChange={(e) => set("newRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newTerm">New term (months)</Label>
                <Input id="newTerm" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.newTermMonths} onChange={(e) => set("newTermMonths", e.target.value)} />
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {saves ? "Lifetime savings" : "Extra lifetime cost"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(Math.abs(result.lifetimeSavings)) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-orange-600">
              {result.monthlyDifference >= 0
                ? `${formatUSD(result.monthlyDifference)} lower monthly payment`
                : `${formatUSD(-result.monthlyDifference)} higher monthly payment`}
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
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Balance comparison chart */}
      {result && result.schedule.length > 1 && <RefinanceChart result={result} />}

      {/* What-if: how different new rates change the monthly payment and lifetime savings. */}
      {result && <NewRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the new (refinanced) interest rate so the user sees the resulting
 *  monthly payment and lifetime savings across a range plus their own rate. */
function NewRateScenarios({ form }: { form: FormState }) {
  const base = num(form.newRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([3, 4, 5, 6, 7, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, newRatePct: String(rate) });
      return {
        rate,
        payment: r?.newPayment ?? 0,
        savings: r?.lifetimeSavings ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "New rate (% / yr)", format: (v) => `${Number(v)}%` },
    { key: "payment", label: "New payment", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "savings", label: "Lifetime savings", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you locked a different rate?"
      caption="Same balance and term — only the refinanced rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="student-loan-refinance-rate-scenarios"
    />
  );
}

function RefinanceChart({ result }: { result: RefinanceResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.current, p.refinanced))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const curPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.current).toFixed(1)}`);
  const refPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.refinanced).toFixed(1)}`);
  const refArea = `M${x(0)},${y(0)} L${refPts.join(" L")} L${x(years)},${y(0)} Z`;
  const curLine = `M${curPts.join(" L")}`;
  const refLine = `M${refPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance: current vs refinanced</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Refinanced</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Current</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Refinance balance comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="refFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={refArea} fill="url(#refFill)" />
        <path d={refLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={curLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
