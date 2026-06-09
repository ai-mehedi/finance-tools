"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCarAffordability,
  formatUSD,
  formatUSD2,
  type CarAffordabilityResult,
} from "@/lib/calculators/car-affordability";

type FormState = {
  monthlyBudget: string;
  downPayment: string;
  tradeIn: string;
  annualRatePct: string;
  termMonths: string;
  salesTaxPct: string;
  monthlyInsurance: string;
  monthlyOther: string;
};

const DEFAULTS: FormState = {
  monthlyBudget: "500",
  downPayment: "3000",
  tradeIn: "0",
  annualRatePct: "7",
  termMonths: "60",
  salesTaxPct: "6",
  monthlyInsurance: "120",
  monthlyOther: "80",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CarAffordabilityResult | null {
  return computeCarAffordability({
    monthlyBudget: num(f.monthlyBudget) || 0,
    downPayment: num(f.downPayment) || 0,
    tradeIn: num(f.tradeIn) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termMonths: num(f.termMonths),
    salesTaxPct: num(f.salesTaxPct) || 0,
    monthlyInsurance: num(f.monthlyInsurance) || 0,
    monthlyOther: num(f.monthlyOther) || 0,
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

export default function CarAffordabilityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CarAffordabilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a monthly budget and loan term greater than 0.");
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
        { label: "Down payment & trade-in", value: result.totalUpfront, color: "bg-zinc-300" },
        { label: "Amount financed", value: result.loanAmount, color: "bg-orange-300" },
        { label: "Interest over loan", value: result.totalInterest, color: "bg-orange-500" },
      ].filter((b) => b.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your budget</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="budget" label="Monthly budget (all-in)" value={form.monthlyBudget} onChange={(v) => set("monthlyBudget", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Money id="down" label="Down payment" value={form.downPayment} onChange={(v) => set("downPayment", v)} />
              <Money id="trade" label="Trade-in value" value={form.tradeIn} onChange={(v) => set("tradeIn", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Loan APR (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Loan term (months)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} />
              </div>
            </div>

            <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-600 [&::-webkit-details-marker]:hidden">
                Tax & running costs (optional)
                <span className="text-xs text-zinc-400 group-open:hidden">Show</span>
              </summary>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="tax">Sales tax (%)</Label>
                  <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.salesTaxPct} onChange={(e) => set("salesTaxPct", e.target.value)} />
                </div>
                <Money id="ins" label="Insurance / mo" value={form.monthlyInsurance} onChange={(v) => set("monthlyInsurance", v)} />
                <Money id="other" label="Fuel etc / mo" value={form.monthlyOther} onChange={(v) => set("monthlyOther", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Car price you can afford</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.vehiclePrice) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Loan payment portion</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyLoanPayment)} / mo</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Amount financed</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.loanAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Price before tax</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.preTaxPrice)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Total interest <span className="font-semibold text-zinc-600">{formatUSD(result.totalInterest)}</span> · Total cost{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.totalCost)}</span>.
            </p>
          )}
        </div>
      </form>

      {result && result.vehiclePrice > 0 && <BreakdownBar result={result} />}
    </div>
  );
}

function BreakdownBar({ result }: { result: CarAffordabilityResult }) {
  const parts = [
    { label: "Down payment & trade-in", value: result.totalUpfront, color: "#d4d4d8" },
    { label: "Amount financed", value: result.loanAmount, color: "#fdba74" },
    { label: "Interest over loan", value: result.totalInterest, color: "#f97316" },
  ].filter((p) => p.value > 0);

  const total = parts.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your money goes</h3>
      <div className="flex h-5 w-full overflow-hidden rounded-full">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color }} aria-label={`${p.label} ${formatUSD(p.value)}`} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-zinc-500">{p.label}</span>
            <span className="ml-auto text-xs font-bold tabular-nums text-zinc-900">{formatUSD(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
