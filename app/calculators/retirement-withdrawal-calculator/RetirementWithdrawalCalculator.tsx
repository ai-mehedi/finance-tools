"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeRetirementWithdrawal,
  formatUSD,
  formatCompact,
  type WithdrawalTiming,
  type RetirementWithdrawalResult,
} from "@/lib/calculators/retirement-withdrawal";

const TIMINGS: { value: WithdrawalTiming; label: string }[] = [
  { value: "begin", label: "Start of year" },
  { value: "end", label: "End of year" },
];

type FormState = {
  startingBalance: string;
  annualWithdrawal: string;
  annualReturnPct: string;
  inflationPct: string;
  years: string;
  timing: WithdrawalTiming;
};

const DEFAULTS: FormState = {
  startingBalance: "1000000",
  annualWithdrawal: "40000",
  annualReturnPct: "6",
  inflationPct: "3",
  years: "30",
  timing: "begin",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RetirementWithdrawalResult | null {
  return computeRetirementWithdrawal({
    startingBalance: num(f.startingBalance) || 0,
    annualWithdrawal: num(f.annualWithdrawal) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    inflationPct: num(f.inflationPct) || 0,
    years: num(f.years),
    timing: f.timing,
  });
}

export default function RetirementWithdrawalCalculator() {
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

  const horizon = Math.round(num(form.years) || 0);
  const breakdown = result
    ? [
        {
          label: "First-year rate",
          value: `${result.firstYearWithdrawalRatePct.toFixed(1)}%`,
          color: "bg-zinc-300",
        },
        {
          label: "Total withdrawn",
          value: formatUSD(result.totalWithdrawn),
          color: "bg-orange-300",
        },
        {
          label: "Growth earned",
          value: formatUSD(result.totalGrowth),
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
                <Label htmlFor="balance">Starting balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <Input
                    id="balance"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11 pl-7"
                    value={form.startingBalance}
                    onChange={(e) => set("startingBalance", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="withdrawal">Annual withdrawal</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    $
                  </span>
                  <Input
                    id="withdrawal"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11 pl-7"
                    value={form.annualWithdrawal}
                    onChange={(e) => set("annualWithdrawal", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                <Label htmlFor="years">Years</Label>
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

            <div>
              <Label htmlFor="timing">Withdrawal timing</Label>
              <Select
                id="timing"
                className="h-11"
                value={form.timing}
                onChange={(e) => set("timing", e.target.value as WithdrawalTiming)}
              >
                {TIMINGS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
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
            {result && result.depleted ? "Money runs out in" : "Balance after the plan"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result
              ? result.depleted
                ? `${result.yearsLasted} yr`
                : formatUSD(result.endingBalance)
              : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.depleted
                ? `Funds last ${result.yearsLasted} of ${horizon} planned years.`
                : `Lasts the full ${horizon}-year horizon with money to spare.`}
            </p>
          )}
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

      {/* Balance chart */}
      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different annual withdrawal amounts change the ending balance and longevity. */}
      {result && <WithdrawalScenarios form={form} />}
    </div>
  );
}

/** Sweeps the annual withdrawal so the user sees how much they could spend and
 *  whether the money still lasts the full horizon, plus their own value. */
function WithdrawalScenarios({ form }: { form: FormState }) {
  const base = num(form.annualWithdrawal) || 0;
  const horizon = Math.round(num(form.years) || 0);

  const { rows, highlightIndex } = useMemo(() => {
    const amounts = Array.from(
      new Set([20000, 30000, 40000, 50000, 60000, base])
    )
      .filter((a) => a >= 0)
      .sort((a, b) => a - b);

    const built = amounts.map((withdrawal) => {
      const r = compute({ ...form, annualWithdrawal: String(withdrawal) });
      return {
        withdrawal,
        lasts: r ? (r.depleted ? `${r.yearsLasted} yr` : `Full ${horizon} yr`) : "—",
        ending: r ? r.endingBalance : 0,
      };
    });

    return {
      rows: built,
      highlightIndex: built.findIndex((r) => r.withdrawal === base),
    };
  }, [form, base, horizon]);

  const columns: GridColumn[] = [
    { key: "withdrawal", label: "Annual withdrawal", format: (v) => formatUSD(Number(v)) },
    { key: "lasts", label: "Money lasts", align: "right" },
    { key: "ending", label: "Ending balance", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you withdrew a different amount each year?"
      caption="Same portfolio, return, and inflation — only the annual withdrawal changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="retirement-withdrawal-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: RetirementWithdrawalResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.endBalance)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.endBalance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Portfolio balance over retirement</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Retirement portfolio balance chart"
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
          <linearGradient id="withdrawFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#withdrawFill)" />
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
            {t} yr
          </text>
        ))}
      </svg>
    </div>
  );
}
