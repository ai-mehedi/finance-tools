"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCac,
  formatUSD,
  type CacResult,
} from "@/lib/calculators/cac";

type FormState = {
  marketingSpend: string;
  salesSpend: string;
  newCustomers: string;
  avgRevenuePerCustomer: string;
  grossMarginPct: string;
};

const DEFAULTS: FormState = {
  marketingSpend: "20000",
  salesSpend: "10000",
  newCustomers: "150",
  avgRevenuePerCustomer: "50",
  grossMarginPct: "70",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CacResult | null {
  return computeCac({
    marketingSpend: num(f.marketingSpend) || 0,
    salesSpend: num(f.salesSpend) || 0,
    newCustomers: num(f.newCustomers),
    avgRevenuePerCustomer: num(f.avgRevenuePerCustomer) || 0,
    grossMarginPct: num(f.grossMarginPct) || 0,
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

export default function CacCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CacResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a number of new customers greater than 0 and non-negative spend.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Spend and customers</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Money id="marketing" label="Marketing spend" value={form.marketingSpend} onChange={(v) => set("marketingSpend", v)} />
            <Money id="sales" label="Sales spend" value={form.salesSpend} onChange={(v) => set("salesSpend", v)} />
          </div>
          <div>
            <Label htmlFor="customers">New customers acquired</Label>
            <Input id="customers" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newCustomers} onChange={(e) => set("newCustomers", e.target.value)} />
          </div>

          <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-600 [&::-webkit-details-marker]:hidden">
              Lifetime value inputs (optional)
              <span className="text-xs text-zinc-400 group-open:hidden">Show</span>
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Money id="arpc" label="Revenue / customer / mo" value={form.avgRevenuePerCustomer} onChange={(v) => set("avgRevenuePerCustomer", v)} />
              <div>
                <Label htmlFor="margin">Gross margin (%)</Label>
                <Input id="margin" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.grossMarginPct} onChange={(e) => set("grossMarginPct", e.target.value)} />
              </div>
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Customer acquisition cost</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.cac) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total spend</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalSpend)}</span>
              </div>
              {result.ltv > 0 && (
                <>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">LTV (24 mo)</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.ltv)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">LTV : CAC</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{result.ltvToCac.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Payback period</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{result.paybackMonths.toFixed(1)} mo</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </div>
    </form>
  );
}
