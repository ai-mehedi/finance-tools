"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeBillingRate,
  formatUSD,
  formatUSD0,
  type BillingRateResult,
} from "@/lib/calculators/billing-rate";

type FormState = {
  targetIncome: string;
  businessCosts: string;
  weeksOff: string;
  hoursPerWeek: string;
  billablePercent: string;
};

const DEFAULTS: FormState = {
  targetIncome: "80000",
  businessCosts: "15000",
  weeksOff: "6",
  hoursPerWeek: "40",
  billablePercent: "70",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BillingRateResult | null {
  return computeBillingRate({
    targetIncome: num(f.targetIncome) || 0,
    businessCosts: num(f.businessCosts) || 0,
    weeksOff: num(f.weeksOff) || 0,
    hoursPerWeek: num(f.hoursPerWeek),
    billablePercent: num(f.billablePercent),
  });
}

export default function BillingRateCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter working hours above 0, weeks off under 52 and a billable share between 1 and 100."
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

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Your numbers</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="income">Target take-home / yr</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.targetIncome} onChange={(e) => set("targetIncome", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="costs">Business costs / yr</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="costs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.businessCosts} onChange={(e) => set("businessCosts", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="hours">Hours / week</Label>
              <Input id="hours" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weeksoff">Weeks off / yr</Label>
              <Input id="weeksoff" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.weeksOff} onChange={(e) => set("weeksOff", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="billable">Billable (%)</Label>
              <Input id="billable" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.billablePercent} onChange={(e) => set("billablePercent", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Hourly rate to charge</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.hourlyRate) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Day rate (8 hr)</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.dailyRate)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Billable hours / yr</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{Math.round(result.billableHours).toLocaleString("en-US")}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Revenue needed / yr</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD0(result.revenueNeeded)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Based on {result.workingWeeks} working weeks a year. Round up to a clean number when you quote clients.
          </p>
        )}
      </div>
      </form>

      {/* What-if: how your billable share changes the rate you must charge. */}
      {result && <BillablePercentScenarios form={form} />}
    </div>
  );
}

/** Sweeps the billable share so the user sees how much higher the rate has to
 *  climb as less of their week turns into billable work. */
function BillablePercentScenarios({ form }: { form: FormState }) {
  const base = num(form.billablePercent);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [50, 60, 70, 80, 90, 100, base];
    const percents = Array.from(new Set(candidates))
      .filter((p) => Number.isFinite(p) && p > 0 && p <= 100)
      .sort((a, b) => a - b);

    const built = percents.map((billablePercent) => {
      const r = compute({ ...form, billablePercent: String(billablePercent) });
      return {
        billablePercent,
        hourlyRate: r?.hourlyRate ?? 0,
        billableHours: r ? Math.round(r.billableHours) : 0,
      };
    });

    return {
      rows: built,
      highlightIndex: built.findIndex((r) => r.billablePercent === base),
    };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "billablePercent", label: "Billable share", format: (v) => `${v}%` },
    { key: "hourlyRate", label: "Rate to charge", align: "right", format: (v) => formatUSD(Number(v)) },
    {
      key: "billableHours",
      label: "Billable hrs / yr",
      align: "right",
      format: (v) => Number(v).toLocaleString("en-US"),
    },
  ];

  return (
    <ScenarioGrid
      title="What if a different share of your week were billable?"
      caption="Same income target and hours — only the billable percentage changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="billing-rate-scenarios"
    />
  );
}
