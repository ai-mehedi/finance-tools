"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeClosingCost,
  formatUSD,
  formatUSD2,
  type ClosingCostResult,
} from "@/lib/calculators/closing-cost";

type FormState = {
  homePrice: string;
  downPayment: string;
  loanOriginationPct: string;
  appraisalFee: string;
  titleInsurancePct: string;
  recordingFees: string;
  prepaidEscrow: string;
  otherFees: string;
};

const DEFAULTS: FormState = {
  homePrice: "350000",
  downPayment: "70000",
  loanOriginationPct: "1",
  appraisalFee: "500",
  titleInsurancePct: "0.5",
  recordingFees: "150",
  prepaidEscrow: "2500",
  otherFees: "800",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ClosingCostResult | null {
  return computeClosingCost({
    homePrice: num(f.homePrice) || 0,
    downPayment: num(f.downPayment) || 0,
    loanOriginationPct: num(f.loanOriginationPct) || 0,
    appraisalFee: num(f.appraisalFee) || 0,
    titleInsurancePct: num(f.titleInsurancePct) || 0,
    recordingFees: num(f.recordingFees) || 0,
    prepaidEscrow: num(f.prepaidEscrow) || 0,
    otherFees: num(f.otherFees) || 0,
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

export default function ClosingCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ClosingCostResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a home price above 0 and a down payment no larger than the price.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Purchase details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="homePrice" label="Home price" value={form.homePrice} onChange={(v) => set("homePrice", v)} />
              <Money id="downPayment" label="Down payment" value={form.downPayment} onChange={(v) => set("downPayment", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="origPct">Loan origination (%)</Label>
                <Input id="origPct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.loanOriginationPct} onChange={(e) => set("loanOriginationPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="titlePct">Title insurance (%)</Label>
                <Input id="titlePct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.titleInsurancePct} onChange={(e) => set("titleInsurancePct", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="appraisal" label="Appraisal fee" value={form.appraisalFee} onChange={(v) => set("appraisalFee", v)} />
              <Money id="recording" label="Recording fees" value={form.recordingFees} onChange={(v) => set("recordingFees", v)} />
              <Money id="escrow" label="Prepaid escrow" value={form.prepaidEscrow} onChange={(v) => set("prepaidEscrow", v)} />
              <Money id="other" label="Other fees" value={form.otherFees} onChange={(v) => set("otherFees", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total closing costs</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.totalClosingCost) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Percent of price</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.percentOfPrice.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Loan amount</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.loanAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Cash to close</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.cashToClose)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Cash to close includes your down payment of{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.cashToClose - result.totalClosingCost)}</span>.
            </p>
          )}
        </div>
      </form>

      {result && result.totalClosingCost > 0 && <BreakdownChart result={result} />}
    </div>
  );
}

function BreakdownChart({ result }: { result: ClosingCostResult }) {
  const lines = result.lines.filter((l) => l.amount > 0);
  if (lines.length === 0) return null;
  const max = Math.max(...lines.map((l) => l.amount)) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Where your closing costs go</h3>
      <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-600">{l.label}</span>
              <span className="font-bold tabular-nums text-zinc-900">{formatUSD2(l.amount)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${(l.amount / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
