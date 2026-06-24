"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSalaryToHourly,
  formatUSD,
  formatUSD2,
  formatCompact,
  type PayPeriod,
  type SalaryToHourlyResult,
} from "@/lib/calculators/salary-to-hourly";

const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "annual", label: "Per year" },
  { value: "monthly", label: "Per month" },
  { value: "weekly", label: "Per week" },
];

type FormState = {
  salary: string;
  period: PayPeriod;
  hoursPerWeek: string;
  weeksPerYear: string;
};

const DEFAULTS: FormState = {
  salary: "65000",
  period: "annual",
  hoursPerWeek: "40",
  weeksPerYear: "52",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SalaryToHourlyResult | null {
  return computeSalaryToHourly({
    salary: num(f.salary),
    period: f.period,
    hoursPerWeek: num(f.hoursPerWeek),
    weeksPerYear: num(f.weeksPerYear),
  });
}

export default function SalaryToHourlyCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a non-negative salary, hours per week above 0, and weeks per year between 1 and 53."
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
        { label: "Annual salary", value: result.annualSalary, color: "bg-zinc-300" },
        { label: "Monthly pay", value: result.monthlyPay, color: "bg-orange-300" },
        { label: "Weekly pay", value: result.weeklyPay, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your salary and schedule, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salary">Salary</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="period">Pay period</Label>
                <Select id="period" className="h-11" value={form.period} onChange={(e) => set("period", e.target.value as PayPeriod)}>
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hours">Hours per week</Label>
                <Input id="hours" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="weeks">Weeks per year</Label>
                <Input id="weeks" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.weeksPerYear} onChange={(e) => set("weeksPerYear", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Equivalent hourly wage</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.hourlyRate) : "—"}
            {result && <span className="text-lg font-bold text-zinc-400"> / hr</span>}
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
            {result && (
              <p className="px-1 pt-1 text-xs text-zinc-500">
                Based on {formatCompact(result.totalHoursPerYear).replace("$", "")} working hours per year.
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Hours-vs-rate chart */}
      {result && result.schedule.length > 1 && <RateChart result={result} />}

      {/* What-if: how the equivalent hourly wage shifts with hours worked per week. */}
      {result && <HoursScenarios form={form} />}
    </div>
  );
}

/** Sweeps the hours worked per week so the user sees how their equivalent
 *  hourly wage and weekly pay change at 30/35/40/45/50 hours plus their own. */
function HoursScenarios({ form }: { form: FormState }) {
  const base = num(form.hoursPerWeek);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [30, 35, 40, 45, 50, base];
    const hours = Array.from(new Set(candidates))
      .filter((h) => Number.isFinite(h) && h > 0)
      .sort((a, b) => a - b);

    const built = hours.map((h) => {
      const r = compute({ ...form, hoursPerWeek: String(h) });
      return {
        hours: h,
        hourly: r?.hourlyRate ?? 0,
        weekly: r?.weeklyPay ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.hours === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "hours", label: "Hours / week", format: (v) => `${v} h` },
    { key: "hourly", label: "Hourly wage", align: "right", format: (v) => formatUSD2(Number(v)) },
    { key: "weekly", label: "Weekly pay", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you worked different hours?"
      caption="Same salary — only the hours worked per week change."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="salary-to-hourly-scenarios"
    />
  );
}

function RateChart({ result }: { result: SalaryToHourlyResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const minH = data[0].hoursPerWeek;
  const maxH = data[data.length - 1].hoursPerWeek;
  const span = maxH - minH || 1;
  const maxVal = Math.max(...data.map((p) => p.hourlyRate)) || 1;

  const x = (h: number) => pad.l + ((h - minH) / span) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.hoursPerWeek).toFixed(1)},${y(p.hourlyRate).toFixed(1)}`);
  const areaPath = `M${x(minH)},${y(0)} L${pts.join(" L")} L${x(maxH)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = data.filter((_, i) => i % 2 === 0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Hourly rate vs hours worked per week</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Hourly rate</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Hourly rate against weekly hours chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="sthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sthFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t.hoursPerWeek} x={x(t.hoursPerWeek)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t.hoursPerWeek}h</text>
        ))}
      </svg>
    </div>
  );
}
