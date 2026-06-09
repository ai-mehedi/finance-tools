"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeCarInsurance,
  formatUSD,
  formatUSD2,
  type CarInsuranceResult,
  type CoverageLevel,
  type DriverAge,
  type DrivingRecord,
  type LocationRisk,
} from "@/lib/calculators/car-insurance";

type FormState = {
  vehicleValue: string;
  age: DriverAge;
  coverage: CoverageLevel;
  record: DrivingRecord;
  annualMileage: string;
  location: LocationRisk;
};

const DEFAULTS: FormState = {
  vehicleValue: "25000",
  age: "25to65",
  coverage: "standard",
  record: "clean",
  annualMileage: "12000",
  location: "medium",
};

const AGES: { value: DriverAge; label: string }[] = [
  { value: "under25", label: "Under 25" },
  { value: "25to65", label: "25 to 65" },
  { value: "over65", label: "Over 65" },
];

const COVERAGES: { value: CoverageLevel; label: string }[] = [
  { value: "liability", label: "Liability only" },
  { value: "standard", label: "Standard" },
  { value: "full", label: "Full coverage" },
];

const RECORDS: { value: DrivingRecord; label: string }[] = [
  { value: "clean", label: "Clean" },
  { value: "minor", label: "Minor incidents" },
  { value: "major", label: "Major violations" },
];

const LOCATIONS: { value: LocationRisk; label: string }[] = [
  { value: "low", label: "Low risk area" },
  { value: "medium", label: "Medium risk area" },
  { value: "high", label: "High risk area" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CarInsuranceResult | null {
  return computeCarInsurance({
    vehicleValue: num(f.vehicleValue) || 0,
    age: f.age,
    coverage: f.coverage,
    record: f.record,
    annualMileage: num(f.annualMileage) || 0,
    location: f.location,
  });
}

export default function CarInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CarInsuranceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative vehicle value and annual mileage.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Driver and vehicle</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="value">Vehicle value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="value" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.vehicleValue} onChange={(e) => set("vehicleValue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="mileage">Annual mileage</Label>
              <Input id="mileage" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualMileage} onChange={(e) => set("annualMileage", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age">Driver age</Label>
              <Select id="age" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value as DriverAge)}>
                {AGES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="coverage">Coverage level</Label>
              <Select id="coverage" className="h-11" value={form.coverage} onChange={(e) => set("coverage", e.target.value as CoverageLevel)}>
                {COVERAGES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="record">Driving record</Label>
              <Select id="record" className="h-11" value={form.record} onChange={(e) => set("record", e.target.value as DrivingRecord)}>
                {RECORDS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location risk</Label>
              <Select id="location" className="h-11" value={form.location} onChange={(e) => set("location", e.target.value as LocationRisk)}>
                {LOCATIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated premium</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD2(result.monthlyPremium) : "—"}
          <span className="ml-1 text-base font-semibold text-zinc-400">/ mo</span>
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Annual premium</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualPremium)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Base rate</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.baseRate)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Coverage multiplier</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.coverageFactor.toFixed(2)}x</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            This is an estimate for comparison only. Your real quote depends on the insurer, deductible and credit history.
          </p>
        )}
      </div>
    </form>
  );
}
