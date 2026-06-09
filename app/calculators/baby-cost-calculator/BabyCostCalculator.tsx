"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBabyCost,
  formatUSD,
  type BabyCostResult,
} from "@/lib/calculators/baby-cost";

type FormState = {
  oneTimeGear: string;
  monthlyDiapers: string;
  monthlyFood: string;
  monthlyChildcare: string;
  monthlyHealthcare: string;
  monthlyClothing: string;
  monthlyOther: string;
};

const DEFAULTS: FormState = {
  oneTimeGear: "2500",
  monthlyDiapers: "80",
  monthlyFood: "150",
  monthlyChildcare: "800",
  monthlyHealthcare: "120",
  monthlyClothing: "60",
  monthlyOther: "70",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BabyCostResult | null {
  return computeBabyCost({
    oneTimeGear: num(f.oneTimeGear) || 0,
    monthlyDiapers: num(f.monthlyDiapers) || 0,
    monthlyFood: num(f.monthlyFood) || 0,
    monthlyChildcare: num(f.monthlyChildcare) || 0,
    monthlyHealthcare: num(f.monthlyHealthcare) || 0,
    monthlyClothing: num(f.monthlyClothing) || 0,
    monthlyOther: num(f.monthlyOther) || 0,
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

const COLORS = ["bg-orange-500", "bg-orange-300", "bg-amber-300", "bg-amber-200", "bg-zinc-300", "bg-zinc-200"];

export default function BabyCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BabyCostResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter at least one cost greater than 0.");
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

  const maxLine = result ? Math.max(...result.lines.map((l) => l.yearly), 1) : 1;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Baby expenses</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your estimates, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="gear" label="One-time gear and setup" value={form.oneTimeGear} onChange={(v) => set("oneTimeGear", v)} />

            <div className="grid grid-cols-2 gap-3">
              <Money id="diapers" label="Diapers / mo" value={form.monthlyDiapers} onChange={(v) => set("monthlyDiapers", v)} />
              <Money id="food" label="Food and formula / mo" value={form.monthlyFood} onChange={(v) => set("monthlyFood", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="childcare" label="Childcare / mo" value={form.monthlyChildcare} onChange={(v) => set("monthlyChildcare", v)} />
              <Money id="healthcare" label="Healthcare / mo" value={form.monthlyHealthcare} onChange={(v) => set("monthlyHealthcare", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="clothing" label="Clothing / mo" value={form.monthlyClothing} onChange={(v) => set("monthlyClothing", v)} />
              <Money id="other" label="Other / mo" value={form.monthlyOther} onChange={(v) => set("monthlyOther", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">First year total</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.firstYearTotal) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">One-time gear</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.oneTime)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Recurring / month</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.monthlyRecurring)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Recurring / year</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.yearlyRecurring)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Yearly breakdown bars */}
      {result && result.lines.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-zinc-900">Yearly cost by category</h3>
          <div className="space-y-3">
            {result.lines.map((l, i) => (
              <div key={l.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-600">{l.label}</span>
                  <span className="font-bold tabular-nums text-zinc-900">{formatUSD(l.yearly)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div className={`h-full rounded-full ${COLORS[i % COLORS.length]}`} style={{ width: `${(l.yearly / maxLine) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
