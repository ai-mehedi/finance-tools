"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeCagr,
  formatUSD,
  formatPct,
  type CagrResult,
} from "@/lib/calculators/cagr";

type FormState = { beginValue: string; endValue: string; years: string };

const DEFAULTS: FormState = { beginValue: "10000", endValue: "25000", years: "5" };

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CagrResult | null {
  return computeCagr({
    beginValue: num(f.beginValue),
    endValue: num(f.endValue) || 0,
    years: num(f.years),
  });
}

export default function CagrCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a beginning value and number of years greater than 0, and a non-negative final value."
      : null;

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
        <h2 className="text-base font-extrabold text-zinc-900">Enter the details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="begin">Initial value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="begin" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.beginValue} onChange={(e) => set("beginValue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="end">Final value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="end" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.endValue} onChange={(e) => set("endValue", e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="years">Number of years</Label>
            <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">CAGR</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatPct(result.cagrPct) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total growth</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.totalGrowthPct)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Absolute gain</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.absoluteGain)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </div>
    </form>

      {/* What-if: how different final values change the CAGR and total gain. */}
      {result && <FinalValueScenarios form={form} />}
    </div>
  );
}

/** Sweeps the final value so the user sees how the CAGR and absolute gain shift
 *  across a range of outcomes, with their own value highlighted. */
function FinalValueScenarios({ form }: { form: FormState }) {
  const base = num(form.endValue) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const begin = num(form.beginValue) || 0;
    // Sensible spread of outcomes anchored on the beginning value, plus the user's own end value.
    const candidates = [
      begin * 0.75,
      begin,
      begin * 1.5,
      begin * 2,
      begin * 3,
      base,
    ].map((v) => Math.round(v));

    const finals = Array.from(new Set(candidates))
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = finals.map((endValue) => {
      const r = compute({ ...form, endValue: String(endValue) });
      return {
        endValue,
        cagr: r?.cagrPct ?? 0,
        gain: r?.absoluteGain ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.endValue === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "endValue", label: "Final value", format: (v) => formatUSD(Number(v)) },
    { key: "cagr", label: "CAGR", align: "right", format: (v) => formatPct(Number(v)) },
    { key: "gain", label: "Absolute gain", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the final value were different?"
      caption="Same starting value and time horizon — only the ending value changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="cagr-final-value-scenarios"
    />
  );
}
