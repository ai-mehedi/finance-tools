"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeAnnualIncome,
  formatUSD,
  type PayPeriod,
  type AnnualIncomeResult,
} from "@/lib/calculators/annual-income";

const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "hourly", label: "Per hour" },
  { value: "daily", label: "Per day" },
  { value: "weekly", label: "Per week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Per month" },
  { value: "annually", label: "Per year" },
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

function compute(f: FormState): AnnualIncomeResult | null {
  return computeAnnualIncome({
    amount: num(f.amount) || 0,
    period: f.period,
    hoursPerWeek: num(f.hoursPerWeek),
    daysPerWeek: num(f.daysPerWeek),
    weeksPerYear: num(f.weeksPerYear),
  });
}

export default function AnnualIncomeCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a valid pay amount and working hours, days and weeks." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const rows = result
    ? [
        { label: "Monthly", value: result.monthly },
        { label: "Every 2 weeks", value: result.biweekly },
        { label: "Weekly", value: result.weekly },
        { label: "Daily", value: result.daily },
        { label: "Hourly", value: result.hourly },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your pay</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Pay amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="hours">Hours / week</Label>
                <Input id="hours" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="days">Days / week</Label>
                <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.daysPerWeek} onChange={(e) => set("daysPerWeek", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="weeks">Weeks / year</Label>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Annual income</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.annual) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{row.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(row.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Based on{" "}
              <span className="font-semibold text-zinc-600">{Math.round(result.hoursPerYear)}</span>{" "}
              paid hours a year.
            </p>
          )}
        </div>
      </form>

      {/* What-if: how different pay amounts change the yearly total. */}
      {result && <PayAmountScenarios form={form} />}
    </div>
  );
}

/** Sweeps the pay amount so the user sees how their annual, monthly and hourly
 *  figures change across a range of rates plus their own current value. */
function PayAmountScenarios({ form }: { form: FormState }) {
  const base = num(form.amount) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const presets = [base * 0.5, base * 0.75, base, base * 1.25, base * 1.5, base * 2];
    const amounts = Array.from(new Set(presets.map((a) => Math.round(a * 100) / 100)))
      .filter((a) => a > 0)
      .sort((a, b) => a - b);

    const built = amounts.map((amount) => {
      const r = compute({ ...form, amount: String(amount) });
      return {
        amount,
        annual: r?.annual ?? 0,
        monthly: r?.monthly ?? 0,
        hourly: r?.hourly ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.amount === Math.round(base * 100) / 100) };
  }, [form, base]);

  const periodLabel = PERIODS.find((p) => p.value === form.period)?.label ?? "Pay amount";

  const columns: GridColumn[] = [
    { key: "amount", label: periodLabel, format: (v) => formatUSD(Number(v)) },
    { key: "annual", label: "Annual", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "monthly", label: "Monthly", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "hourly", label: "Hourly", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your pay rate changed?"
      caption="Same hours, days and weeks — only the pay amount changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="annual-income-scenarios"
    />
  );
}
