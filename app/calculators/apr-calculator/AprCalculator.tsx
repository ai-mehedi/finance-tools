"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeApr,
  formatUSD,
  formatPct,
  type AprResult,
} from "@/lib/calculators/apr";

type FormState = {
  loanAmount: string;
  annualRatePct: string;
  termYears: string;
  fees: string;
};

const DEFAULTS: FormState = {
  loanAmount: "20000",
  annualRatePct: "6",
  termYears: "5",
  fees: "600",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AprResult | null {
  return computeApr({
    loanAmount: num(f.loanAmount),
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
    fees: num(f.fees) || 0,
  });
}

export default function AprCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a loan amount and term greater than 0." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="space-y-6">
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Loan details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Loan amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="fees">Upfront fees</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="fees" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.fees} onChange={(e) => set("fees", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rate">Interest rate (% / yr)</Label>
              <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="term">Loan term (years)</Label>
              <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
          <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
            {copied ? <Check className="text-emerald-500" /> : <Link2 />}
            {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Effective APR</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatPct(result.aprPct) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Monthly payment</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.monthlyPayment)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Amount received</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netAdvance)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total cost of credit</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCost)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            APR folds upfront fees into the rate, so it is higher than the stated interest rate when fees apply.
          </p>
        )}
      </div>
    </form>

      {/* What-if: how different upfront fees change the effective APR and total cost. */}
      {result && <FeeScenarios form={form} />}
    </div>
  );
}

/** Sweeps the upfront fees so the user sees how APR and total cost of credit
 *  climb above the stated rate as fees grow, plus their own value. */
function FeeScenarios({ form }: { form: FormState }) {
  const base = num(form.fees) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const feeOptions = Array.from(new Set([0, 250, 500, 1000, 2000, base]))
      .filter((f) => f >= 0)
      .sort((a, b) => a - b);

    const built = feeOptions.map((fees) => {
      const r = compute({ ...form, fees: String(fees) });
      return {
        fees,
        apr: r?.aprPct ?? 0,
        totalCost: r?.totalCost ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.fees === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "fees", label: "Upfront fees", format: (v) => formatUSD(Number(v)) },
    { key: "apr", label: "Effective APR", align: "right", format: (v) => formatPct(Number(v)) },
    { key: "totalCost", label: "Total cost of credit", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your fees were different?"
      caption="Same loan & rate — only the upfront fees change."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="apr-fee-scenarios"
    />
  );
}
