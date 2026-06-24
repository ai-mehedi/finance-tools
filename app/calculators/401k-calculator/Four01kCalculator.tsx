"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeFour01k,
  formatUSD,
  formatCompact,
  type Four01kResult,
} from "@/lib/calculators/four01k";

type FormState = {
  currentBalance: string;
  annualSalary: string;
  contributionPct: string;
  employerMatchPct: string;
  matchLimitPct: string;
  annualReturnPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  currentBalance: "25000",
  annualSalary: "75000",
  contributionPct: "6",
  employerMatchPct: "50",
  matchLimitPct: "6",
  annualReturnPct: "7",
  years: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): Four01kResult | null {
  return computeFour01k({
    currentBalance: num(f.currentBalance) || 0,
    annualSalary: num(f.annualSalary) || 0,
    contributionPct: num(f.contributionPct) || 0,
    employerMatchPct: num(f.employerMatchPct) || 0,
    matchLimitPct: num(f.matchLimitPct) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    years: num(f.years),
  });
}

export default function Four01kCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a number of years greater than 0 and non-negative values."
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
        { label: "Your contributions", value: result.yourContributions, color: "bg-orange-300" },
        { label: "Employer match", value: result.employerContributions, color: "bg-amber-400" },
        { label: "Investment growth", value: result.totalGrowth, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your 401(k) plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance">Current balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentBalance} onChange={(e) => set("currentBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="salary">Annual salary</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualSalary} onChange={(e) => set("annualSalary", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contrib">Your contribution (% of salary)</Label>
                <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.contributionPct} onChange={(e) => set("contributionPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="match">Employer match (%)</Label>
                <Input id="match" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.employerMatchPct} onChange={(e) => set("employerMatchPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="limit">Match limit (% of salary)</Label>
                <Input id="limit" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.matchLimitPct} onChange={(e) => set("matchLimitPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="return">Return (% / yr)</Label>
                <Input id="return" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualReturnPct} onChange={(e) => set("annualReturnPct", e.target.value)} />
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Balance at retirement</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.futureBalance) : "—"}
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

      {/* Growth chart */}
      {result && result.schedule.length > 1 && <GrowthChart result={result} />}

      {/* What-if: how different contribution rates change the retirement balance. */}
      {result && <ContributionScenarios form={form} />}
    </div>
  );
}

/** Sweeps your contribution rate so the user sees how saving a little more (or
 *  less) of each paycheck changes the final balance and the employer match
 *  they pick up along the way. */
function ContributionScenarios({ form }: { form: FormState }) {
  const base = num(form.contributionPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const pcts = Array.from(new Set([0, 3, 6, 10, 15, base]))
      .filter((p) => p >= 0)
      .sort((a, b) => a - b);

    const built = pcts.map((pct) => {
      const r = compute({ ...form, contributionPct: String(pct) });
      return {
        pct,
        futureBalance: r?.futureBalance ?? 0,
        yourContributions: r?.yourContributions ?? 0,
        employerContributions: r?.employerContributions ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.pct === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "pct", label: "Your contribution", format: (v) => `${Number(v)}%` },
    { key: "futureBalance", label: "Balance at retirement", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "yourContributions", label: "You put in", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "employerContributions", label: "Employer match", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you contributed a different percent?"
      caption="Same salary, return and timeline — only your contribution rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="401k-calculator"
    />
  );
}

function GrowthChart({ result }: { result: Four01kResult }) {
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
  const contribPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.contributed).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const contribLine = `M${contribPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Contributed</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="401(k) balance growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="k401Fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#k401Fill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={contribLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
