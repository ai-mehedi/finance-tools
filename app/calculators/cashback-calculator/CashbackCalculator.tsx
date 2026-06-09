"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCashback,
  formatUSD2,
  type CashbackResult,
} from "@/lib/calculators/cashback";

type FormState = {
  groceriesSpend: string;
  groceriesRate: string;
  diningSpend: string;
  diningRate: string;
  travelSpend: string;
  travelRate: string;
  otherSpend: string;
  otherRate: string;
  annualFee: string;
};

const DEFAULTS: FormState = {
  groceriesSpend: "600",
  groceriesRate: "3",
  diningSpend: "300",
  diningRate: "4",
  travelSpend: "200",
  travelRate: "2",
  otherSpend: "800",
  otherRate: "1",
  annualFee: "95",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CashbackResult | null {
  return computeCashback({
    categories: [
      { monthlySpend: num(f.groceriesSpend) || 0, ratePct: num(f.groceriesRate) || 0 },
      { monthlySpend: num(f.diningSpend) || 0, ratePct: num(f.diningRate) || 0 },
      { monthlySpend: num(f.travelSpend) || 0, ratePct: num(f.travelRate) || 0 },
      { monthlySpend: num(f.otherSpend) || 0, ratePct: num(f.otherRate) || 0 },
    ],
    annualFee: num(f.annualFee) || 0,
  });
}

function Category({
  label,
  spendId,
  rateId,
  spend,
  rate,
  onSpend,
  onRate,
}: {
  label: string;
  spendId: string;
  rateId: string;
  spend: string;
  rate: string;
  onSpend: (v: string) => void;
  onRate: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor={spendId}>{label} spend / mo</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
          <Input id={spendId} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={spend} onChange={(e) => onSpend(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor={rateId}>{label} rate (%)</Label>
        <Input id={rateId} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={rate} onChange={(e) => onRate(e.target.value)} />
      </div>
    </div>
  );
}

export default function CashbackCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CashbackResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative spend amounts, rates and fee.");
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

  const worthIt = result ? result.netAnnualCashback >= 0 : true;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Your spending</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Enter monthly spend and cashback rate per category, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <Category label="Groceries" spendId="grocSpend" rateId="grocRate" spend={form.groceriesSpend} rate={form.groceriesRate} onSpend={(v) => set("groceriesSpend", v)} onRate={(v) => set("groceriesRate", v)} />
          <Category label="Dining" spendId="dineSpend" rateId="dineRate" spend={form.diningSpend} rate={form.diningRate} onSpend={(v) => set("diningSpend", v)} onRate={(v) => set("diningRate", v)} />
          <Category label="Travel" spendId="travSpend" rateId="travRate" spend={form.travelSpend} rate={form.travelRate} onSpend={(v) => set("travelSpend", v)} onRate={(v) => set("travelRate", v)} />
          <Category label="Other" spendId="othSpend" rateId="othRate" spend={form.otherSpend} rate={form.otherRate} onSpend={(v) => set("otherSpend", v)} onRate={(v) => set("otherRate", v)} />

          <div>
            <Label htmlFor="fee">Annual card fee</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="fee" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualFee} onChange={(e) => set("annualFee", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net annual cashback</p>
        <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${worthIt ? "text-zinc-900" : "text-rose-600"}`}>
          {result ? formatUSD2(result.netAnnualCashback) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Cashback / month</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyCashback)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Cashback / year</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.annualCashback)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Effective rate</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.effectiveRatePct.toFixed(2)}%</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            After the annual fee, this card {worthIt ? "earns you" : "costs you"}{" "}
            <span className="font-semibold text-zinc-600">{formatUSD2(Math.abs(result.netAnnualCashback))}</span> per year.
          </p>
        )}
      </div>
    </form>
  );
}
