"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeFreelanceRate,
  formatUSD,
  formatUSD0,
  type FreelanceRateResult,
} from "@/lib/calculators/freelance-rate";

type FormState = {
  targetIncome: string;
  businessCosts: string;
  taxRatePct: string;
  billableHoursPerWeek: string;
  workWeeksPerYear: string;
};

const DEFAULTS: FormState = {
  targetIncome: "80000",
  businessCosts: "8000",
  taxRatePct: "25",
  billableHoursPerWeek: "25",
  workWeeksPerYear: "48",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): FreelanceRateResult | null {
  return computeFreelanceRate({
    targetIncome: num(f.targetIncome) || 0,
    businessCosts: num(f.businessCosts) || 0,
    taxRatePct: num(f.taxRatePct) || 0,
    billableHoursPerWeek: num(f.billableHoursPerWeek),
    workWeeksPerYear: num(f.workWeeksPerYear),
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function FreelanceRateCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<FreelanceRateResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter billable hours and weeks above 0 and a tax rate below 100%.");
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

  const targetNum = num(form.targetIncome) || 0;
  const costsNum = num(form.businessCosts) || 0;
  const breakdown = result
    ? [
        { label: "Your take-home pay", value: targetNum, color: "bg-orange-500" },
        { label: "Business costs", value: costsNum, color: "bg-orange-300" },
        { label: "Taxes", value: result.taxAmount, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your numbers</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="target" label="Target take-home / yr" value={form.targetIncome} onChange={(v) => set("targetIncome", v)} />
              <Money id="costs" label="Business costs / yr" value={form.businessCosts} onChange={(v) => set("businessCosts", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="tax">Tax rate (%)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hours">Billable hrs / wk</Label>
                <Input id="hours" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.billableHoursPerWeek} onChange={(e) => set("billableHoursPerWeek", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="weeks">Work weeks / yr</Label>
                <Input id="weeks" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.workWeeksPerYear} onChange={(e) => set("workWeeksPerYear", e.target.value)} />
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
                  <span className="text-sm font-medium text-zinc-500">Suggested day rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD0(result.dayRate)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Revenue needed / yr</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD0(result.grossRevenueNeeded)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Billable hours / yr</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.billableHoursPerYear.toLocaleString("en-US")}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && breakdown.length > 0 && <RevenueBar breakdown={breakdown} total={result.grossRevenueNeeded} />}
    </div>
  );
}

function RevenueBar({ breakdown, total }: { breakdown: { label: string; value: number; color: string }[]; total: number }) {
  const safeTotal = total > 0 ? total : 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where each dollar of revenue goes</h3>
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-zinc-100">
        {breakdown.map((b) => (
          <div key={b.label} className={b.color} style={{ width: `${(b.value / safeTotal) * 100}%` }} title={b.label} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${b.color}`} />
            <span className="text-xs text-zinc-500">{b.label}</span>
            <span className="ml-auto text-xs font-bold tabular-nums text-zinc-900">{formatUSD0(b.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
