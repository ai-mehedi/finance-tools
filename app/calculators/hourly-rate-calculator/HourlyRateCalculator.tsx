"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
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
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HourlyRateResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Hours/week, days/week and weeks/year must all be greater than 0.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setForm(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
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
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
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
  );
}
