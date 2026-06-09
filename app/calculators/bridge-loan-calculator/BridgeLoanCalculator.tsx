"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBridgeLoan,
  formatUSD,
  type BridgeLoanResult,
} from "@/lib/calculators/bridge-loan";

type FormState = {
  loanAmount: string;
  annualRatePct: string;
  termMonths: string;
  originationFeePct: string;
};

const DEFAULTS: FormState = {
  loanAmount: "250000",
  annualRatePct: "9.5",
  termMonths: "12",
  originationFeePct: "2",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BridgeLoanResult | null {
  return computeBridgeLoan({
    loanAmount: num(f.loanAmount) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termMonths: num(f.termMonths) || 0,
    originationFeePct: num(f.originationFeePct) || 0,
  });
}

export default function BridgeLoanCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BridgeLoanResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a loan amount and term greater than 0, with non-negative rates.");
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
        <h2 className="text-base font-extrabold text-zinc-900">Bridge loan details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="amount">Loan amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="rate">Rate (% / yr)</Label>
              <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="term">Term (months)</Label>
              <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="fee">Fee (%)</Label>
              <Input id="fee" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.originationFeePct} onChange={(e) => set("originationFeePct", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly interest payment</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.monthlyInterest) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total interest</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Origination fee</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.originationFee)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total cost to borrow</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCost)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Payoff at term end</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.payoffAmount)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Total repaid including principal{" "}
            <span className="font-semibold text-zinc-600">{formatUSD(result.totalRepaid)}</span>.
          </p>
        )}
      </div>
    </form>
  );
}
