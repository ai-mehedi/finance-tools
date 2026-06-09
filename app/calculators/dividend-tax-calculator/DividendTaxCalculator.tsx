"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeDividendTax,
  formatUSD,
  type DividendTaxResult,
  type FilingStatus,
} from "@/lib/calculators/dividend-tax";

type FormState = {
  dividendIncome: string;
  type: "qualified" | "ordinary";
  taxableIncome: string;
  filingStatus: FilingStatus;
  ordinaryRatePct: string;
};

const DEFAULTS: FormState = {
  dividendIncome: "5000",
  type: "qualified",
  taxableIncome: "80000",
  filingStatus: "single",
  ordinaryRatePct: "22",
};

const STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head", label: "Head of household" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DividendTaxResult | null {
  return computeDividendTax({
    dividendIncome: num(f.dividendIncome) || 0,
    qualified: f.type === "qualified",
    taxableIncome: num(f.taxableIncome) || 0,
    filingStatus: f.filingStatus,
    ordinaryRatePct: num(f.ordinaryRatePct) || 0,
  });
}

export default function DividendTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DividendTaxResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative amounts and a rate between 0 and 100.");
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

  const isQualified = form.type === "qualified";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Dividend details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dividend">Dividend income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="dividend" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.dividendIncome} onChange={(e) => set("dividendIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Dividend type</Label>
                <Select id="type" className="h-11" value={form.type} onChange={(e) => set("type", e.target.value as FormState["type"])}>
                  <option value="qualified">Qualified</option>
                  <option value="ordinary">Ordinary (non-qualified)</option>
                </Select>
              </div>
            </div>

            {isQualified ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="taxable">Taxable income</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="taxable" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.taxableIncome} onChange={(e) => set("taxableIncome", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Filing status</Label>
                  <Select id="status" className="h-11" value={form.filingStatus} onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="rate">Marginal income tax rate (%)</Label>
                <Input id="rate" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.ordinaryRatePct} onChange={(e) => set("ordinaryRatePct", e.target.value)} />
              </div>
            )}

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Tax owed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.taxOwed) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tax rate applied</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.effectiveRatePct.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Net after tax</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netDividend)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.grossDividend > 0 && <TaxBar result={result} />}
    </div>
  );
}

function TaxBar({ result }: { result: DividendTaxResult }) {
  const total = result.grossDividend || 1;
  const netPct = Math.min(100, (result.netDividend / total) * 100);
  const taxPct = Math.min(100, (result.taxOwed / total) * 100);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Net dividend vs tax</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> You keep</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-zinc-300" /> Tax</span>
        </div>
      </div>
      <div className="flex h-8 w-full overflow-hidden rounded-lg bg-zinc-100">
        <div className="flex items-center justify-center bg-orange-500 text-[11px] font-bold text-white" style={{ width: `${netPct}%` }}>
          {netPct >= 14 ? formatUSD(result.netDividend) : ""}
        </div>
        <div className="flex items-center justify-center bg-zinc-300 text-[11px] font-bold text-zinc-700" style={{ width: `${taxPct}%` }}>
          {taxPct >= 14 ? formatUSD(result.taxOwed) : ""}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Of <span className="font-semibold text-zinc-600">{formatUSD(result.grossDividend)}</span> in dividends, you keep{" "}
        <span className="font-semibold text-zinc-600">{formatUSD(result.netDividend)}</span> after a{" "}
        {result.effectiveRatePct.toFixed(1)}% tax.
      </p>
    </div>
  );
}
