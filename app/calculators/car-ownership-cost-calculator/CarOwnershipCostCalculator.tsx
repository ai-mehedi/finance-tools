"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCarOwnership,
  formatUSD,
  formatUSD2,
  type CarOwnershipResult,
} from "@/lib/calculators/car-ownership-cost";

type FormState = {
  purchasePrice: string;
  downPayment: string;
  loanRatePct: string;
  loanTermMonths: string;
  yearsOwned: string;
  resaleValue: string;
  annualMiles: string;
  mpg: string;
  fuelPricePerGallon: string;
  annualInsurance: string;
  annualMaintenance: string;
  annualOther: string;
};

const DEFAULTS: FormState = {
  purchasePrice: "35000",
  downPayment: "5000",
  loanRatePct: "6.5",
  loanTermMonths: "60",
  yearsOwned: "5",
  resaleValue: "15000",
  annualMiles: "12000",
  mpg: "28",
  fuelPricePerGallon: "3.50",
  annualInsurance: "1600",
  annualMaintenance: "900",
  annualOther: "600",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CarOwnershipResult | null {
  return computeCarOwnership({
    purchasePrice: num(f.purchasePrice) || 0,
    downPayment: num(f.downPayment) || 0,
    loanRatePct: num(f.loanRatePct) || 0,
    loanTermMonths: num(f.loanTermMonths) || 0,
    yearsOwned: num(f.yearsOwned),
    resaleValue: num(f.resaleValue) || 0,
    annualMiles: num(f.annualMiles) || 0,
    mpg: num(f.mpg),
    fuelPricePerGallon: num(f.fuelPricePerGallon) || 0,
    annualInsurance: num(f.annualInsurance) || 0,
    annualMaintenance: num(f.annualMaintenance) || 0,
    annualOther: num(f.annualOther) || 0,
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

function Plain({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function CarOwnershipCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CarOwnershipResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a purchase price, years owned and MPG all greater than 0.");
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
        { label: "Depreciation", value: result.depreciation, color: "bg-orange-500" },
        { label: "Fuel", value: result.fuelCost, color: "bg-orange-300" },
        { label: "Insurance", value: result.insuranceCost, color: "bg-amber-300" },
        { label: "Maintenance", value: result.maintenanceCost, color: "bg-orange-200" },
        { label: "Financing interest", value: result.financingInterest, color: "bg-zinc-400" },
        { label: "Other", value: result.otherCost, color: "bg-zinc-300" },
      ].filter((b) => b.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Vehicle details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="price" label="Purchase price" value={form.purchasePrice} onChange={(v) => set("purchasePrice", v)} />
              <Money id="down" label="Down payment" value={form.downPayment} onChange={(v) => set("downPayment", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Plain id="rate" label="Loan rate (%)" value={form.loanRatePct} onChange={(v) => set("loanRatePct", v)} />
              <Plain id="term" label="Term (months)" value={form.loanTermMonths} onChange={(v) => set("loanTermMonths", v)} />
              <Plain id="years" label="Years owned" value={form.yearsOwned} onChange={(v) => set("yearsOwned", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="resale" label="Resale value" value={form.resaleValue} onChange={(v) => set("resaleValue", v)} />
              <Plain id="miles" label="Miles / yr" value={form.annualMiles} onChange={(v) => set("annualMiles", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Plain id="mpg" label="Fuel economy (MPG)" value={form.mpg} onChange={(v) => set("mpg", v)} />
              <Money id="fuel" label="Fuel price / gal" value={form.fuelPricePerGallon} onChange={(v) => set("fuelPricePerGallon", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Money id="ins" label="Insurance / yr" value={form.annualInsurance} onChange={(v) => set("annualInsurance", v)} />
              <Money id="maint" label="Maintenance / yr" value={form.annualMaintenance} onChange={(v) => set("annualMaintenance", v)} />
              <Money id="other" label="Other / yr" value={form.annualOther} onChange={(v) => set("annualOther", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total cost of ownership</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalCost) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Per year</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.costPerYear)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Per month</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.costPerMonth)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Per mile</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.costPerMile)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && breakdown.length > 0 && <BreakdownChart breakdown={breakdown} total={result.totalCost} />}
    </div>
  );
}

function BreakdownChart({ breakdown, total }: { breakdown: { label: string; value: number; color: string }[]; total: number }) {
  const safeTotal = total > 0 ? total : 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the money goes</h3>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100">
        {breakdown.map((b) => (
          <div
            key={b.label}
            className={b.color}
            style={{ width: `${(b.value / safeTotal) * 100}%` }}
            title={`${b.label}: ${formatUSD(b.value)}`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-zinc-500">
              <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
              {b.label}
            </span>
            <span className="font-bold tabular-nums text-zinc-900">
              {formatUSD(b.value)} <span className="font-medium text-zinc-400">({((b.value / safeTotal) * 100).toFixed(0)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
