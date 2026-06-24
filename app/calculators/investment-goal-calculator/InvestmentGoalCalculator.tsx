"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeInvestmentGoal,
  formatUSD,
  formatCompact,
  type InvestmentGoalResult,
} from "@/lib/calculators/investment-goal";

type FormState = {
  goalAmount: string;
  currentSavings: string;
  annualRatePct: string;
  years: string;
};

const DEFAULTS: FormState = {
  goalAmount: "100000",
  currentSavings: "10000",
  annualRatePct: "7",
  years: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): InvestmentGoalResult | null {
  return computeInvestmentGoal({
    goalAmount: num(f.goalAmount),
    currentSavings: num(f.currentSavings) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    years: num(f.years),
  });
}

export default function InvestmentGoalCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a goal and a number of years greater than 0, with non-negative amounts."
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

  const breakdown = result
    ? [
        { label: "Your starting balance", value: result.startGrowsTo, color: "bg-zinc-300" },
        { label: "Total you contribute", value: result.totalContributions, color: "bg-orange-300" },
        { label: "Growth earned", value: Math.max(0, result.totalGrowth), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your goal</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Tell us the target, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goal">Goal amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="goal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.goalAmount} onChange={(e) => set("goalAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="current">Current savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="current" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Expected return (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years to goal</Label>
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly investment needed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlyContribution) : "—"}
          </p>
          {result && !result.reachable && (
            <p className="mt-1 text-sm font-medium text-emerald-600">
              Your current savings already grow past this goal. No monthly deposit required.
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
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Path to goal chart */}
      {result && result.schedule.length > 1 && <GoalChart result={result} />}

      {/* What-if: how the timeline changes the monthly deposit you need. */}
      {result && <TimelineScenarios form={form} />}
    </div>
  );
}

/** Sweeps the years-to-goal so the user sees how a longer or shorter timeline
 *  changes the required monthly deposit (and the growth that does the work). */
function TimelineScenarios({ form }: { form: FormState }) {
  const base = num(form.years);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [3, 5, 10, 15, 20, 30, base].filter(
      (y) => Number.isFinite(y) && y > 0
    );
    const yearsList = Array.from(new Set(candidates)).sort((a, b) => a - b);

    const built = yearsList.map((years) => {
      const r = compute({ ...form, years: String(years) });
      return {
        years,
        monthly: r?.monthlyContribution ?? 0,
        contributions: r?.totalContributions ?? 0,
        growth: r ? Math.max(0, r.totalGrowth) : 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.years === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "years", label: "Years to goal", format: (v) => `${v} yr` },
    { key: "monthly", label: "Monthly deposit", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "contributions", label: "You contribute", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "growth", label: "Growth earned", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you gave it more (or less) time?"
      caption="Same goal and starting balance — only the timeline changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="investment-goal-timeline-scenarios"
    />
  );
}

function GoalChart({ result }: { result: InvestmentGoalResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(result.goalAmount, ...data.map((p) => p.balance)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const goalY = y(result.goalAmount);

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Path to your goal</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Goal</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Investment goal progress chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="goalFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#goalFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={pad.l} y1={goalY} x2={W - pad.r} y2={goalY} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
