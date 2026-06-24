"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeRetirementCorpus,
  formatUSD,
  formatCompact,
  type RetirementCorpusResult,
} from "@/lib/calculators/retirement-corpus";

type FormState = {
  currentAge: string;
  retirementAge: string;
  lifeExpectancy: string;
  monthlyExpenseToday: string;
  inflationPct: string;
  preRetReturnPct: string;
  postRetReturnPct: string;
};

const DEFAULTS: FormState = {
  currentAge: "32",
  retirementAge: "60",
  lifeExpectancy: "85",
  monthlyExpenseToday: "3000",
  inflationPct: "5",
  preRetReturnPct: "10",
  postRetReturnPct: "7",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RetirementCorpusResult | null {
  return computeRetirementCorpus({
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    lifeExpectancy: num(f.lifeExpectancy),
    monthlyExpenseToday: num(f.monthlyExpenseToday) || 0,
    inflationPct: num(f.inflationPct) || 0,
    preRetReturnPct: num(f.preRetReturnPct) || 0,
    postRetReturnPct: num(f.postRetReturnPct) || 0,
  });
}

export default function RetirementCorpusCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Check your ages: retirement age must be above current age, and life expectancy above retirement age."
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
        {
          label: "Years until retirement",
          value: `${result.yearsToRetire} yr`,
          color: "bg-zinc-300",
        },
        {
          label: "Years in retirement",
          value: `${result.yearsInRetirement} yr`,
          color: "bg-orange-300",
        },
        {
          label: "First-year expense",
          value: formatUSD(result.firstYearExpense),
          color: "bg-orange-500",
        },
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
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="currentAge">Current age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.currentAge}
                  onChange={(e) => set("currentAge", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="retirementAge">Retire at</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.retirementAge}
                  onChange={(e) => set("retirementAge", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lifeExpectancy">Live until</Label>
                <Input
                  id="lifeExpectancy"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.lifeExpectancy}
                  onChange={(e) => set("lifeExpectancy", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expense">Monthly expense today</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                  $
                </span>
                <Input
                  id="expense"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="h-11 pl-7"
                  value={form.monthlyExpenseToday}
                  onChange={(e) => set("monthlyExpenseToday", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="inflation">Inflation (%)</Label>
                <Input
                  id="inflation"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.inflationPct}
                  onChange={(e) => set("inflationPct", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="preRet">Return pre (%)</Label>
                <Input
                  id="preRet"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.preRetReturnPct}
                  onChange={(e) => set("preRetReturnPct", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postRet">Return post (%)</Label>
                <Input
                  id="postRet"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.postRetReturnPct}
                  onChange={(e) => set("postRetReturnPct", e.target.value)}
                />
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
            Corpus required at retirement
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.corpusRequired) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">
                Enter valid values to see results.
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Draw-down chart */}
      {result && result.schedule.length > 1 && <DrawdownChart result={result} />}

      {/* What-if: how retiring earlier or later changes the corpus you need. */}
      {result && <RetirementAgeScenarios form={form} />}
    </div>
  );
}

/** Sweeps the retirement age so the user sees how retiring earlier or later changes
 *  the corpus required, plus how many years that corpus must last. */
function RetirementAgeScenarios({ form }: { form: FormState }) {
  const base = num(form.retirementAge);

  const { rows, highlightIndex } = useMemo(() => {
    const current = num(form.currentAge);
    const life = num(form.lifeExpectancy);
    const candidates = [55, 60, 62, 65, 67, 70, base]
      .filter((a) => Number.isFinite(a) && a > current && a < life);
    const ages = Array.from(new Set(candidates)).sort((a, b) => a - b);

    const built = ages.map((age) => {
      const r = compute({ ...form, retirementAge: String(age) });
      return {
        age,
        corpus: r?.corpusRequired ?? 0,
        years: r ? `${r.yearsInRetirement} yr` : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.age === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "age", label: "Retire at age", format: (v) => `${v}` },
    { key: "years", label: "Years in retirement", align: "right" },
    { key: "corpus", label: "Corpus required", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you retired at a different age?"
      caption="Same expenses and returns — only the retirement age changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="retirement-corpus-retirement-age-scenarios"
    />
  );
}

function DrawdownChart({ result }: { result: RetirementCorpusResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const minAge = data[0].age;
  const maxAge = data[data.length - 1].age || minAge + 1;
  const span = Math.max(maxAge - minAge, 1);
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (age: number) => pad.l + ((age - minAge) / span) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(minAge)},${y(0)} L${balPts.join(" L")} L${x(maxAge)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [minAge, Math.round((minAge + maxAge) / 2), maxAge].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Corpus drawn down in retirement</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Remaining corpus
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Retirement corpus draw-down chart"
      >
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>
              {formatCompact(g.v)}
            </text>
          </g>
        ))}
        <defs>
          <linearGradient id="corpusFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#corpusFill)" />
        <path
          d={balLine}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            age {t}
          </text>
        ))}
      </svg>
    </div>
  );
}
