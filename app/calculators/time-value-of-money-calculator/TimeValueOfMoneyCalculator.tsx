"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeTvm,
  formatUSD,
  formatCompact,
  type SolveFor,
  type PaymentTiming,
  type TvmResult,
} from "@/lib/calculators/time-value-of-money";

const SOLVE_OPTIONS: { value: SolveFor; label: string }[] = [
  { value: "fv", label: "Future value (FV)" },
  { value: "pv", label: "Present value (PV)" },
  { value: "pmt", label: "Payment (PMT)" },
  { value: "rate", label: "Interest rate" },
];

const FREQUENCIES: { value: string; label: string }[] = [
  { value: "1", label: "Annually" },
  { value: "2", label: "Semi-annually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
];

type FormState = {
  solveFor: SolveFor;
  presentValue: string;
  futureValue: string;
  payment: string;
  annualRatePct: string;
  years: string;
  periodsPerYear: string;
  timing: PaymentTiming;
};

const DEFAULTS: FormState = {
  solveFor: "fv",
  presentValue: "5000",
  futureValue: "50000",
  payment: "200",
  annualRatePct: "6",
  years: "20",
  periodsPerYear: "12",
  timing: "end",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TvmResult | null {
  return computeTvm({
    solveFor: f.solveFor,
    presentValue: num(f.presentValue) || 0,
    futureValue: num(f.futureValue) || 0,
    payment: num(f.payment) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    years: num(f.years),
    periodsPerYear: num(f.periodsPerYear),
    timing: f.timing,
  });
}

const LABELS: Record<SolveFor, string> = {
  fv: "Future value",
  pv: "Present value",
  pmt: "Required payment / period",
  rate: "Annual interest rate",
};

export default function TimeValueOfMoneyCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Check your inputs: years and periods must be greater than 0, and the rate solve needs values that can be reached."
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

  const headline =
    result == null
      ? "—"
      : form.solveFor === "rate"
        ? `${result.value.toFixed(2)}%`
        : formatUSD(result.value);

  const breakdown = result
    ? [
        { label: "Present value (PV)", value: formatUSD(result.presentValue), color: "bg-zinc-300" },
        { label: "Future value (FV)", value: formatUSD(result.futureValue), color: "bg-orange-300" },
        { label: "Payment per period", value: formatUSD(result.payment), color: "bg-orange-500" },
        { label: "Rate per period", value: `${result.periodicRatePct.toFixed(3)}%`, color: "bg-orange-400" },
        { label: "Total periods", value: String(result.periods), color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Pick what to solve for, fill the rest, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="solve">Solve for</Label>
              <Select id="solve" className="h-11" value={form.solveFor} onChange={(e) => set("solveFor", e.target.value as SolveFor)}>
                {SOLVE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pv">Present value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pv" type="number" step="any" inputMode="decimal" disabled={form.solveFor === "pv"} className="h-11 pl-7 disabled:bg-zinc-100 disabled:text-zinc-400" value={form.presentValue} onChange={(e) => set("presentValue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="fv">Future value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="fv" type="number" step="any" inputMode="decimal" disabled={form.solveFor === "fv"} className="h-11 pl-7 disabled:bg-zinc-100 disabled:text-zinc-400" value={form.futureValue} onChange={(e) => set("futureValue", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pmt">Payment / period</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pmt" type="number" step="any" inputMode="decimal" disabled={form.solveFor === "pmt"} className="h-11 pl-7 disabled:bg-zinc-100 disabled:text-zinc-400" value={form.payment} onChange={(e) => set("payment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" disabled={form.solveFor === "rate"} className="h-11 disabled:bg-zinc-100 disabled:text-zinc-400" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ppy">Periods / yr</Label>
                <Select id="ppy" className="h-11" value={form.periodsPerYear} onChange={(e) => set("periodsPerYear", e.target.value)}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="timing">Payments at</Label>
                <Select id="timing" className="h-11" value={form.timing} onChange={(e) => set("timing", e.target.value as PaymentTiming)}>
                  <option value="end">Period end</option>
                  <option value="begin">Period start</option>
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

        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{result ? LABELS[result.solveFor] : "Result"}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">{headline}</p>
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

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how the solved-for value moves as the interest rate changes
          (or as the horizon changes when the rate itself is the unknown). */}
      {result && <RateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the single most meaningful input — the annual interest rate — and
 *  shows how the solved-for quantity responds. When the user is solving FOR the
 *  rate, the rate field is derived, so we sweep the horizon (years) instead. */
function RateScenarios({ form }: { form: FormState }) {
  const sweepYears = form.solveFor === "rate";
  const field: keyof FormState = sweepYears ? "years" : "annualRatePct";
  const base = num(form[field]) || 0;

  const { rows, highlightIndex, columns } = useMemo(() => {
    const candidates = sweepYears
      ? [5, 10, 15, 20, 30, base]
      : [2, 4, 6, 8, 10, base];

    const values = Array.from(new Set(candidates))
      .filter((v) => v > 0)
      .sort((a, b) => a - b);

    const built = values.map((v) => {
      const r = compute({ ...form, [field]: String(v) });
      const solved =
        r == null
          ? "—"
          : form.solveFor === "rate"
            ? `${r.value.toFixed(2)}%`
            : formatUSD(r.value);
      return {
        input: v,
        result: solved,
      };
    });

    const cols: GridColumn[] = [
      {
        key: "input",
        label: sweepYears ? "Years" : "Rate (% / yr)",
        format: (v) => (sweepYears ? `${Number(v)} yr` : `${Number(v)}%`),
      },
      { key: "result", label: LABELS[form.solveFor], align: "right" },
    ];

    return {
      rows: built,
      highlightIndex: built.findIndex((r) => r.input === base),
      columns: cols,
    };
  }, [form, field, base, sweepYears]);

  return (
    <ScenarioGrid
      title={sweepYears ? "What if you gave it more time?" : "What if the rate were different?"}
      caption="Same inputs — only the swept value changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="time-value-of-money-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: TvmResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const lastP = data[data.length - 1].period || 1;
  const vals = data.map((p) => p.balance);
  const maxVal = Math.max(...vals, 1);
  const minVal = Math.min(...vals, 0);
  const span = maxVal - minVal || 1;

  const x = (p: number) => pad.l + (p / lastP) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / span) * innerH;

  const pts = data.map((p) => `${x(p.period).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const areaPath = `M${x(0)},${y(minVal)} L${pts.join(" L")} L${x(lastP)},${y(minVal)} Z`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (span / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(lastP / 2), lastP].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance across periods</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Time value of money balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="tvmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#tvmFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t}</text>
        ))}
      </svg>
    </div>
  );
}
