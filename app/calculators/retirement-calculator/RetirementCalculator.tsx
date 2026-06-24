"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeRetirement,
  formatUSD,
  formatCompact,
  type RetirementResult,
} from "@/lib/calculators/retirement";

type FormState = {
  currentAge: string;
  retirementAge: string;
  currentSavings: string;
  monthlyContribution: string;
  preRetReturnPct: string;
  desiredAnnualIncome: string;
  withdrawalRatePct: string;
};

const DEFAULTS: FormState = {
  currentAge: "30",
  retirementAge: "65",
  currentSavings: "25000",
  monthlyContribution: "600",
  preRetReturnPct: "7",
  desiredAnnualIncome: "60000",
  withdrawalRatePct: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RetirementResult | null {
  return computeRetirement({
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    currentSavings: num(f.currentSavings) || 0,
    monthlyContribution: num(f.monthlyContribution) || 0,
    preRetReturnPct: num(f.preRetReturnPct) || 0,
    desiredAnnualIncome: num(f.desiredAnnualIncome) || 0,
    withdrawalRatePct: num(f.withdrawalRatePct),
  });
}

export default function RetirementCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Retirement age must be above your current age, and the withdrawal rate must be above 0."
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

  const startNum = num(form.currentSavings) || 0;
  const breakdown = result
    ? [
        { label: "Starting savings", value: startNum, color: "bg-zinc-300" },
        { label: "Total contributions", value: result.totalContributions, color: "bg-orange-300" },
        { label: "Investment growth", value: result.totalGrowth, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Current age</Label>
                <Input id="age" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retage">Retirement age</Label>
                <Input id="retage" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="savings">Current savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="savings" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="contrib">Monthly contribution</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyContribution} onChange={(e) => set("monthlyContribution", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="return">Return (% / yr)</Label>
                <Input id="return" type="number" step="any" inputMode="decimal" className="h-11" value={form.preRetReturnPct} onChange={(e) => set("preRetReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="wr">Withdrawal rate (%)</Label>
                <Input id="wr" type="number" step="any" inputMode="decimal" className="h-11" value={form.withdrawalRatePct} onChange={(e) => set("withdrawalRatePct", e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="income">Desired annual income in retirement</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.desiredAnnualIncome} onChange={(e) => set("desiredAnnualIncome", e.target.value)} />
                </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Nest egg at retirement</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.nestEgg) : "—"}
          </p>
          {result && (
            <p className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${result.onTrack ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {result.onTrack
                ? `On track — ${formatUSD(result.surplus)} surplus`
                : `Short by ${formatUSD(Math.abs(result.surplus))}`}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                      {b.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Income it can fund / yr</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.sustainableIncome)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <AccumulationChart result={result} />}

      {/* What-if: how different monthly contributions change the nest egg + income. */}
      {result && <ContributionScenarios form={form} />}
    </div>
  );
}

/** Sweeps the monthly contribution so the user sees how saving more each month
 *  changes their projected nest egg and the income it can sustain, alongside
 *  their own current contribution. */
function ContributionScenarios({ form }: { form: FormState }) {
  const base = num(form.monthlyContribution) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const amounts = Array.from(new Set([0, 250, 500, 1000, 1500, 2000, base]))
      .filter((a) => a >= 0)
      .sort((a, b) => a - b);

    const built = amounts.map((contribution) => {
      const r = compute({ ...form, monthlyContribution: String(contribution) });
      return {
        contribution,
        nestEgg: r?.nestEgg ?? 0,
        income: r?.sustainableIncome ?? 0,
        status: r ? (r.onTrack ? "On track" : "Short") : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.contribution === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "contribution", label: "Monthly contribution", format: (v) => formatUSD(Number(v)) },
    { key: "nestEgg", label: "Nest egg", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "income", label: "Income / yr", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "status", label: "Goal", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you contributed more each month?"
      caption="Same plan — only the monthly contribution changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="retirement-contribution-scenarios"
    />
  );
}

function AccumulationChart({ result }: { result: RetirementResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const startAge = data[0].age;
  const endAge = data[data.length - 1].age;
  const ageSpan = endAge - startAge || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (age: number) => pad.l + ((age - startAge) / ageSpan) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const contribPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.contributed).toFixed(1)}`);
  const areaPath = `M${x(startAge)},${y(0)} L${balPts.join(" L")} L${x(endAge)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const contribLine = `M${contribPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const ageTicks = [startAge, Math.round((startAge + endAge) / 2), endAge].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Savings growth to retirement</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Paid in</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Retirement savings growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="retFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#retFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={contribLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {ageTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>age {t}</text>
        ))}
      </svg>
    </div>
  );
}
