"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeDiscretionaryIncome,
  formatUSD,
  formatUSD2,
  type DiscretionaryIncomeResult,
} from "@/lib/calculators/discretionary-income";

type FormState = {
  annualIncome: string;
  householdSize: string;
  povertyMultiplePct: string;
  paymentPct: string;
};

const DEFAULTS: FormState = {
  annualIncome: "60000",
  householdSize: "1",
  povertyMultiplePct: "150",
  paymentPct: "10",
};

const MULTIPLES: { value: string; label: string }[] = [
  { value: "150", label: "150% (IBR, PAYE, ICR)" },
  { value: "225", label: "225% (SAVE plan)" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DiscretionaryIncomeResult | null {
  return computeDiscretionaryIncome({
    annualIncome: num(f.annualIncome) || 0,
    householdSize: num(f.householdSize) || 1,
    povertyMultiplePct: num(f.povertyMultiplePct) || 0,
    paymentPct: num(f.paymentPct) || 0,
  });
}

export default function DiscretionaryIncomeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DiscretionaryIncomeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative income and a household size of at least 1.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Your situation</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="income">Adjusted gross income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="size">Household size</Label>
              <Input id="size" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.householdSize} onChange={(e) => set("householdSize", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="multiple">Poverty line multiple</Label>
              <Select id="multiple" className="h-11" value={form.povertyMultiplePct} onChange={(e) => set("povertyMultiplePct", e.target.value)}>
                {MULTIPLES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="payment">Payment share (%)</Label>
              <Input id="payment" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.paymentPct} onChange={(e) => set("paymentPct", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Discretionary income</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.discretionaryIncome) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Poverty threshold</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.povertyThreshold)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Est. annual payment</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualPayment)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Est. monthly payment</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyPayment)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Based on a {formatUSD(result.povertyGuideline)} poverty guideline for your household size.
          </p>
        )}
      </div>
    </form>
  );
}
