"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeDiscount,
  formatUSD,
  type DiscountResult,
} from "@/lib/calculators/discount";

type FormState = {
  originalPrice: string;
  discountPct: string;
  taxPct: string;
};

const DEFAULTS: FormState = {
  originalPrice: "120",
  discountPct: "25",
  taxPct: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DiscountResult | null {
  return computeDiscount({
    originalPrice: num(f.originalPrice) || 0,
    discountPct: num(f.discountPct) || 0,
    taxPct: num(f.taxPct) || 0,
  });
}

export default function DiscountCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DiscountResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative price and a discount between 0 and 100.");
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
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Enter the details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="price">Original price</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.discountPct} onChange={(e) => set("discountPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tax">Sales tax (%)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxPct} onChange={(e) => set("taxPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Final price</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.finalPrice) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">You save</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.savings)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Price after discount</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.priceAfterDiscount)}</span>
                </div>
                {result.tax > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Sales tax</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.tax)}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.originalPrice > 0 && <PriceBar result={result} />}
    </div>
  );
}

function PriceBar({ result }: { result: DiscountResult }) {
  const total = result.originalPrice || 1;
  const savePct = Math.min(100, (result.savings / total) * 100);
  const payPct = Math.min(100, (result.priceAfterDiscount / total) * 100);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where your money goes</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> You pay</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-200" /> You save</span>
        </div>
      </div>
      <div className="flex h-8 w-full overflow-hidden rounded-lg bg-zinc-100">
        <div className="flex items-center justify-center bg-orange-500 text-[11px] font-bold text-white" style={{ width: `${payPct}%` }}>
          {payPct >= 14 ? formatUSD(result.priceAfterDiscount) : ""}
        </div>
        <div className="flex items-center justify-center bg-orange-200 text-[11px] font-bold text-orange-800" style={{ width: `${savePct}%` }}>
          {savePct >= 14 ? formatUSD(result.savings) : ""}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        On an original price of <span className="font-semibold text-zinc-600">{formatUSD(result.originalPrice)}</span>, a{" "}
        {result.discountPct}% discount saves you <span className="font-semibold text-zinc-600">{formatUSD(result.savings)}</span>.
      </p>
    </div>
  );
}
