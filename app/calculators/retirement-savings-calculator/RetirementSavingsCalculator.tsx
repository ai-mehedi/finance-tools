"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeRetirementSavings,
  formatUSD,
  formatCompact,
  type RetirementSavingsResult,
} from "@/lib/calculators/retirement-savings";

type FormState = {
  goalAmount: string;
  currentSavings: string;
  currentMonthly: string;
  annualReturnPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  goalAmount: "1000000",
  currentSavings: "50000",
  currentMonthly: "600",
  annualReturnPct: "7",
  years: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RetirementSavingsResult | null {
  return computeRetirementSavings({
    goalAmount: num(f.goalAmount) || 0,
    currentSavings: num(f.currentSavings) || 0,
    currentMonthly: num(f.currentMonthly) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    years: num(f.years),
  });
}

export default function RetirementSavingsCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a number of years greater than 0 and non-negative amounts."
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

  const onTrack = result ? result.shortfall <= 0 : false;
  const breakdown = result
    ? [
        {
          label: "Projected at current rate",
          value: formatUSD(result.projectedNestEgg),
          color: "bg-orange-300",
        },
        {
          label: onTrack ? "Surplus vs goal" : "Shortfall vs goal",
          value: formatUSD(Math.abs(result.shortfall)),
          color: onTrack ? "bg-emerald-500" : "bg-rose-400",
        },
        {
          label: "Growth on the plan",
          value: formatUSD(result.growthOnRequired),
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goal">Nest egg goal</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <Input
                    id="goal"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11 pl-7"
                    value={form.goalAmount}
                    onChange={(e) => set("goalAmount", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="savings">Current savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <Input
                    id="savings"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11 pl-7"
                    value={form.currentSavings}
                    onChange={(e) => set("currentSavings", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="monthly">Saving now / mo</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <Input
                    id="monthly"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11 pl-7"
                    value={form.currentMonthly}
                    onChange={(e) => set("currentMonthly", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Return (% / yr)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.annualReturnPct}
                  onChange={(e) => set("annualReturnPct", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="years">Years to retire</Label>
                <Input
                  id="years"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="h-11"
                  value={form.years}
                  onChange={(e) => set("years", e.target.value)}
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
            Monthly saving needed
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.requiredMonthly) : "—"}
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

      {/* Savings chart */}
      {result && result.schedule.length > 1 && <SavingsChart result={result} />}

      {/* What-if: how different monthly saving amounts change where you land. */}
      {result && <MonthlySavingScenarios form={form} />}
    </div>
  );
}

/** Sweeps the current monthly contribution so the user sees the projected nest
 *  egg and surplus/shortfall vs goal at a range of saving rates plus their own. */
function MonthlySavingScenarios({ form }: { form: FormState }) {
  const base = num(form.currentMonthly) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const amounts = Array.from(new Set([0, 250, 500, 1000, 2000, base]))
      .filter((a) => a >= 0)
      .sort((a, b) => a - b);

    const built = amounts.map((monthly) => {
      const r = compute({ ...form, currentMonthly: String(monthly) });
      const shortfall = r?.shortfall ?? 0;
      return {
        monthly,
        projected: r?.projectedNestEgg ?? 0,
        gap: shortfall <= 0 ? `+${formatUSD(-shortfall)}` : `-${formatUSD(shortfall)}`,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.monthly === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "monthly", label: "Saving / month", format: (v) => formatUSD(Number(v)) },
    { key: "projected", label: "Projected nest egg", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "gap", label: "Surplus / shortfall", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you saved more each month?"
      caption="Same goal and return — only your monthly saving amount changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="retirement-savings-scenarios"
    />
  );
}

function SavingsChart({ result }: { result: RetirementSavingsResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal =
    Math.max(...data.map((p) => Math.max(p.required, p.current)), result.goalAmount) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const reqPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.required).toFixed(1)}`);
  const curPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.current).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${reqPts.join(" L")} L${x(years)},${y(0)} Z`;
  const reqLine = `M${reqPts.join(" L")}`;
  const curLine = `M${curPts.join(" L")}`;
  const goalY = y(result.goalAmount);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Path to your goal</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-orange-400/40" /> On plan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-zinc-400" /> Current rate
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Retirement savings path chart"
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
          <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#savingsFill)" />
        <line
          x1={pad.l}
          y1={goalY}
          x2={W - pad.r}
          y2={goalY}
          stroke="#10b981"
          strokeWidth={1.25}
          strokeDasharray="2 3"
        />
        <path
          d={reqLine}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={curLine}
          fill="none"
          stroke="#a1a1aa"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            {t} yr
          </text>
        ))}
      </svg>
    </div>
  );
}
