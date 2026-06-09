"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBitcoinProfit,
  formatUSD,
  formatBTC,
  formatPct,
  type BitcoinProfitResult,
} from "@/lib/calculators/bitcoin-profit";

type FormState = {
  investment: string;
  buyPrice: string;
  sellPrice: string;
  buyFeePct: string;
  sellFeePct: string;
};

const DEFAULTS: FormState = {
  investment: "5000",
  buyPrice: "40000",
  sellPrice: "60000",
  buyFeePct: "0.5",
  sellFeePct: "0.5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BitcoinProfitResult | null {
  return computeBitcoinProfit({
    investment: num(f.investment),
    buyPrice: num(f.buyPrice),
    sellPrice: num(f.sellPrice) || 0,
    buyFeePct: num(f.buyFeePct) || 0,
    sellFeePct: num(f.sellFeePct) || 0,
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

export default function BitcoinProfitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BitcoinProfitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an investment and buy price greater than 0, with non-negative fees.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Trade details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <Money id="investment" label="Amount invested" value={form.investment} onChange={(v) => set("investment", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Money id="buyPrice" label="Buy price / BTC" value={form.buyPrice} onChange={(v) => set("buyPrice", v)} />
            <Money id="sellPrice" label="Sell price / BTC" value={form.sellPrice} onChange={(v) => set("sellPrice", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="buyFee">Buy fee (%)</Label>
              <Input id="buyFee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.buyFeePct} onChange={(e) => set("buyFeePct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sellFee">Sell fee (%)</Label>
              <Input id="sellFee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.sellFeePct} onChange={(e) => set("sellFeePct", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{result && !result.isProfit ? "Net loss" : "Net profit"}</p>
        <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result ? (result.isProfit ? "text-emerald-600" : "text-rose-600") : "text-zinc-900"}`}>
          {result ? formatUSD(result.profit) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Return on investment</span>
                <span className={`text-sm font-bold tabular-nums ${result.isProfit ? "text-emerald-600" : "text-rose-600"}`}>{formatPct(result.roiPct)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">BTC bought</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatBTC(result.coins)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Proceeds after fees</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netProceeds)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total fees paid</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalFees)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </div>
    </form>
  );
}
