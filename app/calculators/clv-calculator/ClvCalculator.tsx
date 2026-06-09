"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeClv,
  formatUSD,
  formatUSD2,
  type ClvResult,
} from "@/lib/calculators/clv";

type FormState = {
  avgOrderValue: string;
  purchasesPerYear: string;
  grossMarginPct: string;
  lifespanYears: string;
  acquisitionCost: string;
};

const DEFAULTS: FormState = {
  avgOrderValue: "75",
  purchasesPerYear: "4",
  grossMarginPct: "60",
  lifespanYears: "5",
  acquisitionCost: "120",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ClvResult | null {
  return computeClv({
    avgOrderValue: num(f.avgOrderValue) || 0,
    purchasesPerYear: num(f.purchasesPerYear) || 0,
    grossMarginPct: num(f.grossMarginPct) || 0,
    lifespanYears: num(f.lifespanYears),
    acquisitionCost: num(f.acquisitionCost) || 0,
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

export default function ClvCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ClvResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a customer lifespan greater than 0 and non-negative values.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Customer details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="aov" label="Average order value" value={form.avgOrderValue} onChange={(v) => set("avgOrderValue", v)} />
              <div>
                <Label htmlFor="freq">Purchases / year</Label>
                <Input id="freq" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.purchasesPerYear} onChange={(e) => set("purchasesPerYear", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="margin">Gross margin (%)</Label>
                <Input id="margin" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.grossMarginPct} onChange={(e) => set("grossMarginPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lifespan">Lifespan (years)</Label>
                <Input id="lifespan" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.lifespanYears} onChange={(e) => set("lifespanYears", e.target.value)} />
              </div>
            </div>
            <Money id="cac" label="Acquisition cost (CAC)" value={form.acquisitionCost} onChange={(v) => set("acquisitionCost", v)} />

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Lifetime value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.grossClv) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Annual revenue</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualRevenue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Annual gross profit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualProfit)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Net of acquisition cost</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netClv)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              About <span className="font-semibold text-zinc-600">{result.totalPurchases.toFixed(0)}</span> purchases over the lifetime.
              {result.clvToCacRatio > 0 && (
                <> CLV to CAC ratio <span className="font-semibold text-zinc-600">{result.clvToCacRatio.toFixed(1)}x</span>.</>
              )}
            </p>
          )}
        </div>
      </form>

      {result && result.grossClv > 0 && <ValueBar result={result} />}
    </div>
  );
}

function ValueBar({ result }: { result: ClvResult }) {
  const profit = Math.max(0, result.netClv);
  const cac = Math.max(0, result.grossClv - result.netClv);
  const total = profit + cac || 1;
  const profitPct = (profit / total) * 100;
  const cacPct = (cac / total) * 100;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where the lifetime value goes</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Net profit</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /> Acquisition cost</span>
        </div>
      </div>
      <div className="flex h-8 w-full overflow-hidden rounded-lg bg-zinc-100">
        <div className="flex items-center justify-center bg-orange-500 text-[11px] font-bold text-white" style={{ width: `${profitPct}%` }}>
          {profitPct >= 12 ? formatUSD2(profit) : ""}
        </div>
        <div className="flex items-center justify-center bg-zinc-300 text-[11px] font-bold text-zinc-700" style={{ width: `${cacPct}%` }}>
          {cacPct >= 12 ? formatUSD2(cac) : ""}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Gross lifetime value <span className="font-semibold text-zinc-600">{formatUSD2(result.grossClv)}</span>, of which{" "}
        <span className="font-semibold text-zinc-600">{formatUSD2(cac)}</span> is spent acquiring the customer.
      </p>
    </div>
  );
}
