"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeFire,
  formatUSD,
  formatCompact,
  type FireResult,
} from "@/lib/calculators/fire";

type FormState = {
  currentAge: string;
  currentSavings: string;
  annualContribution: string;
  annualExpenses: string;
  realReturnPct: string;
  withdrawalRatePct: string;
};

const DEFAULTS: FormState = {
  currentAge: "30",
  currentSavings: "50000",
  annualContribution: "30000",
  annualExpenses: "40000",
  realReturnPct: "5",
  withdrawalRatePct: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): FireResult | null {
  return computeFire({
    currentAge: num(f.currentAge) || 0,
    currentSavings: num(f.currentSavings) || 0,
    annualContribution: num(f.annualContribution) || 0,
    annualExpenses: num(f.annualExpenses),
    realReturnPct: num(f.realReturnPct) || 0,
    withdrawalRatePct: num(f.withdrawalRatePct),
  });
}

export default function FireCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter annual expenses above 0 and a withdrawal rate above 0."
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

  const yearsLabel = result
    ? result.reachedAtStart
      ? "Already there"
      : result.yearsToFire === null
        ? "70+ years"
        : `${result.yearsToFire} years`
    : "—";

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your numbers</h2>
          <p className="mt-0.5 text-sm text-zinc-500">All amounts in today's dollars. Press Calculate when ready.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Current age</Label>
                <Input id="age" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="savings">Current savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="savings" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contrib">Annual savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualContribution} onChange={(e) => set("annualContribution", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="expenses">Annual expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="expenses" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualExpenses} onChange={(e) => set("annualExpenses", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="return">Real return (% / yr)</Label>
                <Input id="return" type="number" step="any" inputMode="decimal" className="h-11" value={form.realReturnPct} onChange={(e) => set("realReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="swr">Withdrawal rate (%)</Label>
                <Input id="swr" type="number" step="any" inputMode="decimal" className="h-11" value={form.withdrawalRatePct} onChange={(e) => set("withdrawalRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Your FIRE number</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.fireNumber) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Years to FIRE</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{yearsLabel}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">FIRE age</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.fireAge === null ? "—" : result.fireAge}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Passive income / mo</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.monthlyPassiveIncome)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <FireChart result={result} />}

      {/* What-if: how different annual savings change years to FIRE + FIRE age. */}
      {result && <ContributionScenarios form={form} />}
    </div>
  );
}

/** Sweeps annual savings so the user sees how saving more (or less) each year
 *  changes the time to financial independence. The FIRE number itself is fixed
 *  by expenses + withdrawal rate, so only the path to it changes. */
function ContributionScenarios({ form }: { form: FormState }) {
  const base = num(form.annualContribution) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const values = Array.from(
      new Set([0, 10000, 20000, 30000, 50000, base]),
    )
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = values.map((contribution) => {
      const r = compute({ ...form, annualContribution: String(contribution) });
      return {
        contribution,
        years:
          r && r.yearsToFire !== null
            ? r.reachedAtStart
              ? "Already there"
              : `${r.yearsToFire} yr`
            : r && r.yearsToFire === null
              ? "70+ yr"
              : "—",
        fireAge: r && r.fireAge !== null ? String(r.fireAge) : "—",
      };
    });

    return {
      rows: built,
      highlightIndex: built.findIndex((r) => r.contribution === base),
    };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "contribution", label: "Annual savings", format: (v) => formatUSD(Number(v)) },
    { key: "years", label: "Years to FIRE", align: "right" },
    { key: "fireAge", label: "FIRE age", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you saved more each year?"
      caption="Same FIRE number — only your annual savings rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="fire-contribution-scenarios"
    />
  );
}

function FireChart({ result }: { result: FireResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(result.fireNumber, ...data.map((p) => p.portfolio)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.portfolio).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  const fireY = y(result.fireNumber);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Path to financial independence</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Portfolio</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> FIRE number</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Path to financial independence chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="fireFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#fireFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={pad.l} y1={fireY} x2={W - pad.r} y2={fireY} stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 4" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
