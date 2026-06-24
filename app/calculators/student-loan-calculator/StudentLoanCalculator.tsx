"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeStudentLoan,
  formatUSD,
  formatCompact,
  type StudentLoanResult,
} from "@/lib/calculators/student-loan";

type FormState = {
  principal: string;
  annualRatePct: string;
  termYears: string;
  graceMonths: string;
  capitalize: "yes" | "no";
};

const DEFAULTS: FormState = {
  principal: "30000",
  annualRatePct: "6.5",
  termYears: "10",
  graceMonths: "6",
  capitalize: "yes",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): StudentLoanResult | null {
  return computeStudentLoan({
    principal: num(f.principal),
    annualRatePct: num(f.annualRatePct),
    termYears: num(f.termYears),
    graceMonths: num(f.graceMonths) || 0,
    capitalizeGraceInterest: f.capitalize === "yes",
  });
}

export default function StudentLoanCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a loan amount and term greater than 0, and a non-negative rate." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const breakdown = result
    ? [
        { label: "Principal", value: result.startingBalance - result.graceInterest, color: "bg-zinc-300" },
        { label: "Grace interest", value: result.graceInterest, color: "bg-orange-300" },
        { label: "Repayment interest", value: result.totalInterest - result.graceInterest, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Loan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your loan terms, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="principal">Loan amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="principal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.principal} onChange={(e) => set("principal", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="term">Repayment (yrs)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="grace">Grace (months)</Label>
                <Input id="grace" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.graceMonths} onChange={(e) => set("graceMonths", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cap">Capitalize?</Label>
                <Select id="cap" className="h-11" value={form.capitalize} onChange={(e) => set("capitalize", e.target.value as "yes" | "no")}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly payment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlyPayment) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total cost</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Payoff time</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {Math.floor(result.payoffMonths / 12)} yr {result.payoffMonths % 12} mo
                  </span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">What you actually pay</h3>
          <div className="space-y-2">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                  {b.label}
                </span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(Math.max(0, b.value))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance chart */}
      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different interest rates change the monthly payment + total interest. */}
      {result && <RateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the annual interest rate so the user sees how the monthly payment and
 *  total interest shift across a range of rates plus their own value. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.annualRatePct);

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([3, 4.5, 6, 7.5, 9, base]))
      .filter((r) => Number.isFinite(r) && r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, annualRatePct: String(rate) });
      return {
        rate,
        monthly: r?.monthlyPayment ?? 0,
        interest: r?.totalInterest ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Interest rate", format: (v) => `${Number(v)}%` },
    { key: "monthly", label: "Monthly payment", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your interest rate were different?"
      caption="Same loan amount and term — only the annual rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="student-loan-rate-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: StudentLoanResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), Math.round(years)].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Remaining balance</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Student loan balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="slFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#slFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
