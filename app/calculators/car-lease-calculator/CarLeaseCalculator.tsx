"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCarLease,
  formatUSD,
  formatUSD2,
  type CarLeaseResult,
} from "@/lib/calculators/car-lease";

type FormState = {
  msrp: string;
  negotiatedPrice: string;
  downPayment: string;
  tradeIn: string;
  residualPct: string;
  annualRatePct: string;
  termMonths: string;
  salesTaxPct: string;
};

const DEFAULTS: FormState = {
  msrp: "40000",
  negotiatedPrice: "37000",
  downPayment: "2500",
  tradeIn: "0",
  residualPct: "55",
  annualRatePct: "6",
  termMonths: "36",
  salesTaxPct: "7",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CarLeaseResult | null {
  return computeCarLease({
    msrp: num(f.msrp) || 0,
    negotiatedPrice: num(f.negotiatedPrice) || 0,
    downPayment: num(f.downPayment) || 0,
    tradeIn: num(f.tradeIn) || 0,
    residualPct: num(f.residualPct) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termMonths: num(f.termMonths),
    salesTaxPct: num(f.salesTaxPct) || 0,
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

export default function CarLeaseCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CarLeaseResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an MSRP, price and lease term greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Lease details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="msrp" label="MSRP (sticker)" value={form.msrp} onChange={(v) => set("msrp", v)} />
              <Money id="price" label="Negotiated price" value={form.negotiatedPrice} onChange={(v) => set("negotiatedPrice", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="down" label="Down payment" value={form.downPayment} onChange={(v) => set("downPayment", v)} />
              <Money id="trade" label="Trade-in value" value={form.tradeIn} onChange={(v) => set("tradeIn", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="residual">Residual (%)</Label>
                <Input id="residual" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.residualPct} onChange={(e) => set("residualPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">APR (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Term (months)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="tax">Sales tax (%)</Label>
              <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.salesTaxPct} onChange={(e) => set("salesTaxPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly lease payment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.monthlyPayment) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Depreciation
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyDepreciation)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" /> Finance charge
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyFinance)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Sales tax
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyTax)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Residual value <span className="font-semibold text-zinc-600">{formatUSD(result.residualValue)}</span> · Total lease cost{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.totalLeaseCost)}</span>.
            </p>
          )}
        </div>
      </form>

      {result && result.monthlyPayment > 0 && <BreakdownBar result={result} />}
    </div>
  );
}

function BreakdownBar({ result }: { result: CarLeaseResult }) {
  const parts = [
    { label: "Depreciation", value: result.monthlyDepreciation, color: "#f97316" },
    { label: "Finance charge", value: result.monthlyFinance, color: "#fdba74" },
    { label: "Sales tax", value: result.monthlyTax, color: "#fcd34d" },
  ].filter((p) => p.value > 0);

  const total = parts.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Monthly payment breakdown</h3>
      <div className="flex h-5 w-full overflow-hidden rounded-full">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color }} aria-label={`${p.label} ${formatUSD2(p.value)}`} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-zinc-500">{p.label}</span>
            <span className="ml-auto text-xs font-bold tabular-nums text-zinc-900">{formatUSD2(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
