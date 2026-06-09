"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeBondYield,
  formatUSD,
  formatPct,
  type BondYieldResult,
} from "@/lib/calculators/bond-yield";

const FREQUENCIES: { value: string; label: string }[] = [
  { value: "1", label: "Annually" },
  { value: "2", label: "Semi-annually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
];

type FormState = {
  faceValue: string;
  couponRatePct: string;
  price: string;
  yearsToMaturity: string;
  paymentsPerYear: string;
};

const DEFAULTS: FormState = {
  faceValue: "1000",
  couponRatePct: "5",
  price: "950",
  yearsToMaturity: "10",
  paymentsPerYear: "2",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BondYieldResult | null {
  return computeBondYield({
    faceValue: num(f.faceValue) || 0,
    couponRatePct: num(f.couponRatePct) || 0,
    price: num(f.price) || 0,
    yearsToMaturity: num(f.yearsToMaturity) || 0,
    paymentsPerYear: num(f.paymentsPerYear) || 0,
  });
}

export default function BondYieldCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BondYieldResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a face value, price, term and frequency greater than 0.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Bond details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="face">Face value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="face" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.faceValue} onChange={(e) => set("faceValue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="price">Market price</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="coupon">Coupon (% / yr)</Label>
              <Input id="coupon" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.couponRatePct} onChange={(e) => set("couponRatePct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="years">Years to maturity</Label>
              <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsToMaturity} onChange={(e) => set("yearsToMaturity", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="freq">Payments / yr</Label>
              <Select id="freq" className="h-11" value={form.paymentsPerYear} onChange={(e) => set("paymentsPerYear", e.target.value)}>
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Yield to maturity</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatPct(result.ytmPct) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Current yield</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.currentYieldPct)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Annual coupon</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualCoupon)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total coupons</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCoupons)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Capital gain</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.capitalGain)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Total return if held to maturity{" "}
            <span className="font-semibold text-zinc-600">{formatUSD(result.totalReturn)}</span>.
          </p>
        )}
      </div>
    </form>
  );
}
