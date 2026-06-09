"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCostPerMile,
  formatUSD,
  formatUSD2,
  formatUSD3,
  type CostPerMileResult,
} from "@/lib/calculators/cost-per-mile";

type FormState = {
  milesPerMonth: string;
  monthlyInsurance: string;
  monthlyDepreciation: string;
  monthlyLoanPayment: string;
  monthlyOther: string;
  fuelPricePerGallon: string;
  milesPerGallon: string;
  maintenancePerMile: string;
};

const DEFAULTS: FormState = {
  milesPerMonth: "1000",
  monthlyInsurance: "120",
  monthlyDepreciation: "250",
  monthlyLoanPayment: "0",
  monthlyOther: "30",
  fuelPricePerGallon: "3.50",
  milesPerGallon: "28",
  maintenancePerMile: "0.09",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CostPerMileResult | null {
  return computeCostPerMile({
    milesPerMonth: num(f.milesPerMonth),
    monthlyInsurance: num(f.monthlyInsurance) || 0,
    monthlyDepreciation: num(f.monthlyDepreciation) || 0,
    monthlyLoanPayment: num(f.monthlyLoanPayment) || 0,
    monthlyOther: num(f.monthlyOther) || 0,
    fuelPricePerGallon: num(f.fuelPricePerGallon) || 0,
    milesPerGallon: num(f.milesPerGallon),
    maintenancePerMile: num(f.maintenancePerMile) || 0,
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

export default function CostPerMileCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CostPerMileResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter miles per month and miles per gallon greater than 0.");
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
        { label: "Fixed costs", value: result.fixedCostPerMile, color: "bg-orange-500" },
        { label: "Fuel", value: result.fuelCostPerMile, color: "bg-orange-300" },
        { label: "Maintenance", value: result.variableCostPerMile - result.fuelCostPerMile, color: "bg-amber-300" },
      ].filter((b) => b.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Driving costs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="miles">Miles per month</Label>
                <Input id="miles" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.milesPerMonth} onChange={(e) => set("milesPerMonth", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mpg">Miles per gallon</Label>
                <Input id="mpg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.milesPerGallon} onChange={(e) => set("milesPerGallon", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="fuel" label="Fuel price / gallon" value={form.fuelPricePerGallon} onChange={(v) => set("fuelPricePerGallon", v)} />
              <Money id="maint" label="Maintenance / mile" value={form.maintenancePerMile} onChange={(v) => set("maintenancePerMile", v)} />
            </div>

            <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-600 [&::-webkit-details-marker]:hidden">
                Fixed monthly costs (optional)
                <span className="text-xs text-zinc-400 group-open:hidden">Show</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Money id="ins" label="Insurance / mo" value={form.monthlyInsurance} onChange={(v) => set("monthlyInsurance", v)} />
                <Money id="dep" label="Depreciation / mo" value={form.monthlyDepreciation} onChange={(v) => set("monthlyDepreciation", v)} />
                <Money id="loan" label="Loan payment / mo" value={form.monthlyLoanPayment} onChange={(v) => set("monthlyLoanPayment", v)} />
                <Money id="other" label="Other / mo" value={form.monthlyOther} onChange={(v) => set("monthlyOther", v)} />
              </div>
            </details>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Cost per mile</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD3(result.totalCostPerMile) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD3(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              About <span className="font-semibold text-zinc-600">{formatUSD2(result.totalMonthlyCost)}</span> per month or{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.totalAnnualCost)}</span> per year.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
