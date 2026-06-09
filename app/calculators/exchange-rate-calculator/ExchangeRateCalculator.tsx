"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeExchangeRate,
  formatNumber,
  type ExchangeRateResult,
} from "@/lib/calculators/exchange-rate";

type FormState = {
  amount: string;
  rate: string;
  feePct: string;
  fromCode: string;
  toCode: string;
};

const DEFAULTS: FormState = {
  amount: "1000",
  rate: "0.92",
  feePct: "1",
  fromCode: "USD",
  toCode: "EUR",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ExchangeRateResult | null {
  return computeExchangeRate({
    amount: num(f.amount) || 0,
    rate: num(f.rate),
    feePct: num(f.feePct) || 0,
  });
}

export default function ExchangeRateCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ExchangeRateResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an exchange rate greater than 0 and non-negative amounts.");
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

  const from = form.fromCode.trim().toUpperCase() || "FROM";
  const to = form.toCode.trim().toUpperCase() || "TO";

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Conversion details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Enter the rate and amount, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fromCode">From currency</Label>
              <Input id="fromCode" type="text" maxLength={5} className="h-11 uppercase" value={form.fromCode} onChange={(e) => set("fromCode", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="toCode">To currency</Label>
              <Input id="toCode" type="text" maxLength={5} className="h-11 uppercase" value={form.toCode} onChange={(e) => set("toCode", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount to convert ({from})</Label>
            <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rate">Exchange rate</Label>
              <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.rate} onChange={(e) => set("rate", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="fee">Fee / markup (%)</Label>
              <Input id="fee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.feePct} onChange={(e) => set("feePct", e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Rate is how many {to} you get for 1 {from}.
          </p>

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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">You receive ({to})</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatNumber(result.netConverted) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Before fee</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.converted)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Fee</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.fee)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Effective rate</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.effectiveRate)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            1 {to} = <span className="font-semibold text-zinc-600">{formatNumber(result.inverseRate)}</span> {from} at the quoted rate.
          </p>
        )}
      </div>
    </form>
  );
}
