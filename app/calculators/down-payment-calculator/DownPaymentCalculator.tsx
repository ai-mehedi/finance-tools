"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeDownPayment,
  formatUSD,
  formatPct,
  type DownPaymentResult,
} from "@/lib/calculators/down-payment";

type FormState = {
  homePrice: string;
  downPaymentPct: string;
  closingCostPct: string;
};

const DEFAULTS: FormState = {
  homePrice: "350000",
  downPaymentPct: "20",
  closingCostPct: "3",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DownPaymentResult | null {
  return computeDownPayment({
    homePrice: num(f.homePrice) || 0,
    downPaymentPct: num(f.downPaymentPct) || 0,
    closingCostPct: num(f.closingCostPct) || 0,
  });
}

export default function DownPaymentCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DownPaymentResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a home price greater than 0 and a percentage between 0 and 100.");
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

  const segments = result
    ? [
        { label: "Down payment", value: result.downPayment, color: "bg-orange-500" },
        { label: "Loan amount", value: result.loanAmount, color: "bg-orange-200" },
      ]
    : [];
  const segTotal = segments.reduce((s, b) => s + b.value, 0) || 1;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Purchase details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="price">Home price</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.homePrice} onChange={(e) => set("homePrice", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dp">Down payment (%)</Label>
                <Input id="dp" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.downPaymentPct} onChange={(e) => set("downPaymentPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cc">Closing costs (%)</Label>
                <Input id="cc" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.closingCostPct} onChange={(e) => set("closingCostPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Down payment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.downPayment) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Loan amount</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.loanAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Closing costs</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.closingCosts)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Cash needed</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.cashNeeded)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Loan to value</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.loanToValuePct)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.pmiLikely
                ? "A down payment under 20% usually means private mortgage insurance (PMI) is added to your monthly cost."
                : "At 20% or more down, you typically avoid private mortgage insurance (PMI)."}
            </p>
          )}
        </div>
      </form>

      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">How the price splits</h3>
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {segments.map((s) => (
              <div key={s.label} className={s.color} style={{ width: `${(s.value / segTotal) * 100}%` }} title={`${s.label}: ${formatUSD(s.value)}`} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            {segments.map((s) => (
              <span key={s.label} className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                {s.label} <span className="font-bold text-zinc-900">{formatUSD(s.value)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
