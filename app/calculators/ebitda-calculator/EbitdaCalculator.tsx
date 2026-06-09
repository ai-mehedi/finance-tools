"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { computeEbitda, formatUSD, type EbitdaResult } from "@/lib/calculators/ebitda";

type FormState = {
  netIncome: string;
  interest: string;
  taxes: string;
  depreciation: string;
  amortization: string;
  revenue: string;
};

const DEFAULTS: FormState = {
  netIncome: "500000",
  interest: "80000",
  taxes: "120000",
  depreciation: "150000",
  amortization: "50000",
  revenue: "3000000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): EbitdaResult | null {
  return computeEbitda({
    netIncome: num(f.netIncome) || 0,
    interest: num(f.interest) || 0,
    taxes: num(f.taxes) || 0,
    depreciation: num(f.depreciation) || 0,
    amortization: num(f.amortization) || 0,
    revenue: num(f.revenue) || 0,
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function EbitdaCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<EbitdaResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter valid numbers. Add-back items cannot be negative.");
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
        { label: "Net income", value: num(form.netIncome) || 0, color: "bg-orange-500" },
        { label: "Interest", value: num(form.interest) || 0, color: "bg-orange-300" },
        { label: "Taxes", value: num(form.taxes) || 0, color: "bg-amber-300" },
        { label: "Depreciation", value: num(form.depreciation) || 0, color: "bg-zinc-400" },
        { label: "Amortization", value: num(form.amortization) || 0, color: "bg-zinc-300" },
      ].filter((b) => b.value !== 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Income statement figures</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter values from your income statement, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="netIncome" label="Net income" value={form.netIncome} onChange={(v) => set("netIncome", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Money id="interest" label="Interest expense" value={form.interest} onChange={(v) => set("interest", v)} />
              <Money id="taxes" label="Income taxes" value={form.taxes} onChange={(v) => set("taxes", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="depreciation" label="Depreciation" value={form.depreciation} onChange={(v) => set("depreciation", v)} />
              <Money id="amortization" label="Amortization" value={form.amortization} onChange={(v) => set("amortization", v)} />
            </div>
            <Money id="revenue" label="Revenue (optional, for margin)" value={form.revenue} onChange={(v) => set("revenue", v)} />

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">EBITDA</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.ebitda) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Total add-backs <span className="font-semibold text-zinc-600">{formatUSD(result.addBacks)}</span>
              {result.margin !== null && (
                <> · EBITDA margin <span className="font-semibold text-zinc-600">{result.margin.toFixed(1)}%</span></>
              )}
              .
            </p>
          )}
        </div>
      </form>

      {result && breakdown.length > 1 && <BridgeBar result={result} breakdown={breakdown} />}
    </div>
  );
}

function BridgeBar({ result, breakdown }: { result: EbitdaResult; breakdown: { label: string; value: number; color: string }[] }) {
  const positives = breakdown.filter((b) => b.value > 0);
  const total = positives.reduce((s, b) => s + b.value, 0) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">How EBITDA is built up</h3>
      <div className="flex h-6 w-full overflow-hidden rounded-full">
        {positives.map((b) => (
          <div key={b.label} className={b.color} style={{ width: `${(b.value / total) * 100}%` }} title={`${b.label}: ${formatUSD(b.value)}`} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500">
        {positives.map((b) => (
          <span key={b.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
            {b.label} {((b.value / total) * 100).toFixed(0)}%
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Net income plus interest, taxes, depreciation and amortization equals EBITDA of {formatUSD(result.ebitda)}.
      </p>
    </div>
  );
}
