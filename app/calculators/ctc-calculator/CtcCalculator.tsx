"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCtc,
  formatUSD,
  type CtcResult,
} from "@/lib/calculators/ctc";

type FormState = {
  annualCtc: string;
  basicPct: string;
  retirementPct: string;
  gratuityPct: string;
  taxPct: string;
};

const DEFAULTS: FormState = {
  annualCtc: "120000",
  basicPct: "45",
  retirementPct: "6",
  gratuityPct: "4",
  taxPct: "18",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CtcResult | null {
  return computeCtc({
    annualCtc: num(f.annualCtc) || 0,
    basicPct: num(f.basicPct) || 0,
    retirementPct: num(f.retirementPct) || 0,
    gratuityPct: num(f.gratuityPct) || 0,
    taxPct: num(f.taxPct) || 0,
  });
}

const COLORS = ["bg-orange-500", "bg-amber-400", "bg-orange-300", "bg-zinc-400", "bg-zinc-300"];

export default function CtcCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CtcResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a CTC above 0 and a basic pay percent between 1 and 100.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Salary structure</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="ctc">Annual CTC</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="ctc" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualCtc} onChange={(e) => set("annualCtc", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="basic">Basic pay (% of CTC)</Label>
                <Input id="basic" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.basicPct} onChange={(e) => set("basicPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retire">Retirement (% of basic)</Label>
                <Input id="retire" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementPct} onChange={(e) => set("retirementPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gratuity">Gratuity (% of basic)</Label>
                <Input id="gratuity" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.gratuityPct} onChange={(e) => set("gratuityPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tax">Effective tax rate (%)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxPct} onChange={(e) => set("taxPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly take-home</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlyTakeHome) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Annual take-home</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualTakeHome)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Gross salary</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.grossSalary)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Income tax</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.incomeTax)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <CtcBreakdown result={result} />}
    </div>
  );
}

function CtcBreakdown({ result }: { result: CtcResult }) {
  const total = result.annualCtc || 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Where your CTC goes</h3>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-100">
        {result.components.map((c, i) => (
          <div
            key={c.label}
            className={COLORS[i % COLORS.length]}
            style={{ width: `${(c.value / total) * 100}%` }}
            title={`${c.label}: ${formatUSD(c.value)}`}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {result.components.map((c, i) => (
          <div key={c.label} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-600">
              <span className={`h-2.5 w-2.5 rounded-full ${COLORS[i % COLORS.length]}`} />
              {c.label}
            </span>
            <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(c.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
