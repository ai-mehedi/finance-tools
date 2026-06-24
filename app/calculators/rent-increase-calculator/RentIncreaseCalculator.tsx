"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeRentIncrease,
  formatUSD,
  formatCompact,
  type IncreaseMode,
  type RentIncreaseResult,
} from "@/lib/calculators/rent-increase";

const MODES: { value: IncreaseMode; label: string }[] = [
  { value: "percent", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed amount ($)" },
];

type FormState = {
  currentRent: string;
  increase: string;
  mode: IncreaseMode;
  years: string;
};

const DEFAULTS: FormState = {
  currentRent: "1500",
  increase: "5",
  mode: "percent",
  years: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RentIncreaseResult | null {
  return computeRentIncrease({
    currentRent: num(f.currentRent),
    increase: num(f.increase),
    mode: f.mode,
    years: num(f.years),
  });
}

export default function RentIncreaseCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a rent above 0, a non-negative increase and at least 1 year to project." : null;

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
        { label: "New monthly rent", value: result.newMonthlyRent, color: "bg-orange-500" },
        { label: "Extra per month", value: result.monthlyDifference, color: "bg-orange-300" },
        { label: "Extra per year", value: result.annualDifference, color: "bg-zinc-300" },
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
                <Label htmlFor="rent">Current monthly rent</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="rent" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentRent} onChange={(e) => set("currentRent", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="mode">Increase type</Label>
                <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as IncreaseMode)}>
                  {MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="increase">{form.mode === "percent" ? "Increase (% / yr)" : "Increase ($ / yr)"}</Label>
                <div className="relative">
                  {form.mode === "fixed" && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  )}
                  <Input id="increase" type="number" min={0} step="any" inputMode="decimal" className={`h-11 ${form.mode === "fixed" ? "pl-7" : ""}`} value={form.increase} onChange={(e) => set("increase", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="years">Years to project</Label>
                <Input id="years" type="number" min={1} step={1} inputMode="numeric" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">New rent</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.newMonthlyRent) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              up {result.effectivePercent.toFixed(1)}% from {formatUSD(result.newMonthlyRent - result.monthlyDifference)}
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

      {/* Projection chart */}
      {result && result.schedule.length > 1 && <RentChart result={result} />}

      {/* What-if: how different annual increases change the new rent and yearly cost. */}
      {result && <IncreaseScenarios form={form} />}
    </div>
  );
}

/** Sweeps the annual increase so the user sees the new monthly rent, extra per
 *  year, and projected rent at a range of rates plus their own value. */
function IncreaseScenarios({ form }: { form: FormState }) {
  const base = num(form.increase) || 0;
  const isPercent = form.mode === "percent";

  const { rows, highlightIndex } = useMemo(() => {
    const presets = isPercent ? [0, 2, 3, 5, 8, 10] : [0, 25, 50, 100, 150, 200];
    const values = Array.from(new Set([...presets, base]))
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = values.map((increase) => {
      const r = compute({ ...form, increase: String(increase) });
      return {
        increase,
        newMonthlyRent: r?.newMonthlyRent ?? 0,
        annualDifference: r?.annualDifference ?? 0,
        projectedRent: r?.projectedRent ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.increase === base) };
  }, [form, base, isPercent]);

  const columns: GridColumn[] = [
    {
      key: "increase",
      label: isPercent ? "Increase / yr" : "Increase / yr ($)",
      format: (v) => (isPercent ? `${Number(v)}%` : formatUSD(Number(v))),
    },
    { key: "newMonthlyRent", label: "New monthly rent", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "annualDifference", label: "Extra / year", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "projectedRent", label: "Projected rent", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the annual increase were different?"
      caption="Same rent and horizon — only the yearly increase changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="rent-increase-scenarios"
    />
  );
}

function RentChart({ result }: { result: RentIncreaseResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.monthlyRent)) || 1;

  const barGap = innerW / data.length;
  const barW = Math.max(6, barGap * 0.55);
  const yOf = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: yOf(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Projected monthly rent by year</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Monthly rent</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected rent chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((p, i) => {
          const cx = pad.l + barGap * i + barGap / 2;
          const top = yOf(p.monthlyRent);
          const h = pad.t + innerH - top;
          return (
            <g key={i}>
              <rect x={cx - barW / 2} y={top} width={barW} height={h} rx={3} fill={p.year === 0 ? "#fb923c" : "#f97316"} />
              <text x={cx} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.year === 0 ? "now" : `${p.year}y`}</text>
            </g>
          );
        })}
        <text x={pad.l} y={pad.t} className="fill-transparent" fontSize={1}>{years}</text>
      </svg>
    </div>
  );
}
