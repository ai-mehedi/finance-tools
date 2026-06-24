"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeHourlyRate,
  formatUSD,
  type PayPeriod,
  type HourlyRateResult,
} from "@/lib/calculators/hourly-rate";

const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "hourly", label: "Per hour" },
  { value: "daily", label: "Per day" },
  { value: "weekly", label: "Per week" },
  { value: "monthly", label: "Per month" },
  { value: "yearly", label: "Per year" },
];

type FormState = {
  amount: string;
  period: PayPeriod;
  hoursPerWeek: string;
  daysPerWeek: string;
  weeksPerYear: string;
};

const DEFAULTS: FormState = {
  amount: "25",
  period: "hourly",
  hoursPerWeek: "40",
  daysPerWeek: "5",
  weeksPerYear: "52",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

// Hoisted so it can seed the initial result below.
function compute(f: FormState): HourlyRateResult | null {
  return computeHourlyRate({
    amount: num(f.amount) || 0,
    period: f.period,
    hoursPerWeek: num(f.hoursPerWeek),
    daysPerWeek: num(f.daysPerWeek),
    weeksPerYear: num(f.weeksPerYear),
  });
}

export default function HourlyRateCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null ? "Hours/week, days/week and weeks/year must all be greater than 0." : null;

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
        { label: "Per day", value: result.daily },
        { label: "Per week", value: result.weekly },
        { label: "Per month", value: result.monthly },
        { label: "Per year", value: result.yearly },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Enter your pay</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="amount">Pay amount</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  className="h-11 pl-7"
                />
              </div>
              <Select
                aria-label="Pay period"
                value={form.period}
                onChange={(e) => set("period", e.target.value as PayPeriod)}
                className="h-11 w-40"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="hpw">Hours / week</Label>
              <Input id="hpw" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dpw">Days / week</Label>
              <Input id="dpw" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.daysPerWeek} onChange={(e) => set("daysPerWeek", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wpy">Weeks / year</Label>
              <Input id="wpy" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.weeksPerYear} onChange={(e) => set("weeksPerYear", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Your hourly rate</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.hourly) : "—"}
          <span className="ml-1 text-base font-semibold text-zinc-400">/hr</span>
        </p>

        <div className="mt-5 space-y-2">
          {result ? (
            breakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter a valid schedule to see results.</p>
          )}
        </div>

        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Based on {form.hoursPerWeek || 0} hrs/week × {form.weeksPerYear || 0} weeks ={" "}
            <span className="font-semibold text-zinc-600">{result.annualHours.toLocaleString("en-US")} paid hours/year</span>. Figures are gross, before tax.
          </p>
        )}
      </div>
      </form>

      {/* What-if: how working different hours per week changes your pay. */}
      {result && <HoursPerWeekScenarios form={form} />}
    </div>
  );
}

/** Sweeps hours worked per week so the user sees how their hourly rate and
 *  annual pay shift at 20/30/35/40/45/50 hrs plus their own value. */
function HoursPerWeekScenarios({ form }: { form: FormState }) {
  const base = num(form.hoursPerWeek);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [20, 30, 35, 40, 45, 50, base];
    const hours = Array.from(new Set(candidates))
      .filter((h) => Number.isFinite(h) && h > 0)
      .sort((a, b) => a - b);

    const built = hours.map((h) => {
      const r = compute({ ...form, hoursPerWeek: String(h) });
      return {
        hours: h,
        hourly: r?.hourly ?? 0,
        yearly: r?.yearly ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.hours === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "hours", label: "Hours / week", format: (v) => `${Number(v)} hrs` },
    { key: "hourly", label: "Hourly rate", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "yearly", label: "Per year", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you worked different hours?"
      caption="Same pay setup — only the hours worked per week changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="hourly-rate-hours-scenarios"
    />
  );
}
