"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCommission,
  formatUSD,
  type CommissionResult,
} from "@/lib/calculators/commission";

type FormState = {
  salesAmount: string;
  commissionRatePct: string;
  baseSalary: string;
  tierThreshold: string;
  tierRatePct: string;
};

const DEFAULTS: FormState = {
  salesAmount: "50000",
  commissionRatePct: "5",
  baseSalary: "3000",
  tierThreshold: "30000",
  tierRatePct: "8",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CommissionResult | null {
  return computeCommission({
    salesAmount: num(f.salesAmount) || 0,
    commissionRatePct: num(f.commissionRatePct) || 0,
    baseSalary: num(f.baseSalary) || 0,
    tierThreshold: num(f.tierThreshold) || 0,
    tierRatePct: f.tierRatePct.trim() === "" ? undefined : num(f.tierRatePct),
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

export default function CommissionCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CommissionResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a sales amount and rate that are zero or greater.");
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
        { label: "Base salary", value: result.baseSalary, color: "bg-zinc-300" },
        { label: "Base commission", value: result.baseCommission, color: "bg-orange-300" },
        { label: "Tier commission", value: result.tierCommission, color: "bg-orange-500" },
      ].filter((b) => b.value > 0)
    : [];

  const totalForBar = breakdown.reduce((s, b) => s + b.value, 0) || 1;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Sales details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="sales" label="Sales amount" value={form.salesAmount} onChange={(v) => set("salesAmount", v)} />
              <div>
                <Label htmlFor="rate">Commission rate (%)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.commissionRatePct} onChange={(e) => set("commissionRatePct", e.target.value)} />
              </div>
            </div>

            <Money id="base" label="Base salary (optional)" value={form.baseSalary} onChange={(v) => set("baseSalary", v)} />

            <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-600 [&::-webkit-details-marker]:hidden">
                Tiered rate (optional)
                <span className="text-xs text-zinc-400 group-open:hidden">Show</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Money id="threshold" label="Sales above" value={form.tierThreshold} onChange={(v) => set("tierThreshold", v)} />
                <div>
                  <Label htmlFor="tierRate">Tier rate (%)</Label>
                  <Input id="tierRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.tierRatePct} onChange={(e) => set("tierRatePct", e.target.value)} />
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">Sales above the threshold earn the tier rate. Leave the tier rate blank to use one flat rate.</p>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total commission</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalCommission) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Total pay <span className="font-semibold text-zinc-600">{formatUSD(result.totalPay)}</span> · Effective rate{" "}
              <span className="font-semibold text-zinc-600">{result.effectiveRatePct.toFixed(2)}%</span> of sales.
            </p>
          )}
        </div>
      </form>

      {result && breakdown.length > 1 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Pay breakdown</h3>
          <div className="flex h-6 w-full overflow-hidden rounded-full bg-zinc-100">
            {breakdown.map((b) => (
              <div key={b.label} className={b.color} style={{ width: `${(b.value / totalForBar) * 100}%` }} title={`${b.label}: ${formatUSD(b.value)}`} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500">
            {breakdown.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                {b.label} {((b.value / totalForBar) * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
