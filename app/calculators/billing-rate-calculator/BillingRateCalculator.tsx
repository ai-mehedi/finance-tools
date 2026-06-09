"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BillingRateResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter working hours above 0, weeks off under 52 and a billable share between 1 and 100.");
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

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
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
  );
}
