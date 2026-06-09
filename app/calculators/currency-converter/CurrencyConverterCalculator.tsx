"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  convertCurrency,
  formatMoney,
  formatRate,
  CURRENCIES,
  type ConvertResult,
} from "@/lib/calculators/currency-converter";

type FormState = {
  amount: string;
  from: string;
  to: string;
};

const DEFAULTS: FormState = {
  amount: "100",
  from: "USD",
  to: "EUR",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ConvertResult | null {
  return convertCurrency({
    amount: num(f.amount) || 0,
    from: f.from,
    to: f.to,
  });
}

export default function CurrencyConverterCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ConvertResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an amount of 0 or more and pick two currencies.");
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

  function swap() {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Convert currency</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Pick currencies and an amount, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="from">From</Label>
              <Select id="from" className="h-11" value={form.from} onChange={(e) => set("from", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Select id="to" className="h-11" value={form.to} onChange={(e) => set("to", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <button type="button" onClick={swap} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Swap currencies
          </button>

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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Converted amount</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatMoney(result.converted, result.toInfo.symbol) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">You convert</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatMoney(num(form.amount) || 0, result.fromInfo.symbol)} {result.fromInfo.code}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Exchange rate</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">1 {result.fromInfo.code} = {formatRate(result.rate)} {result.toInfo.code}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          Rates shown are static reference values for illustration, not live market rates.
        </p>
      </div>
    </form>
  );
}
