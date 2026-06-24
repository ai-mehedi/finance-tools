"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeAnnualizedReturn,
  formatUSD,
  formatPct,
  type AnnualizedReturnResult,
} from "@/lib/calculators/annualized-return";

type FormState = { beginValue: string; endValue: string; years: string };

const DEFAULTS: FormState = { beginValue: "10000", endValue: "18000", years: "5" };

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AnnualizedReturnResult | null {
  return computeAnnualizedReturn({
    beginValue: num(f.beginValue),
    endValue: num(f.endValue),
    years: num(f.years),
  });
}

export default function AnnualizedReturnCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a starting value and number of years greater than 0." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const gainPositive = result ? result.totalGain >= 0 : true;

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Investment values</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="begin">Beginning value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="begin" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.beginValue} onChange={(e) => set("beginValue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="end">Ending value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="end" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.endValue} onChange={(e) => set("endValue", e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="years">Holding period (years)</Label>
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Annualized return</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatPct(result.annualizedPct) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Total return</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.totalReturnPct)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">{gainPositive ? "Total gain" : "Total loss"}</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalGain)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            This is the constant yearly rate (CAGR) that grows your beginning value into the ending value.
          </p>
        )}
      </div>
      </form>

      {/* What-if: how the annualized rate changes across different holding periods. */}
      {result && <HoldingPeriodScenarios form={form} />}
    </div>
  );
}

/** Sweeps the holding period so the user sees how the same total gain spreads
 *  into different annualized (CAGR) rates over 1 / 3 / 5 / 10 / 20 years plus
 *  their own value. */
function HoldingPeriodScenarios({ form }: { form: FormState }) {
  const base = num(form.years);

  const { rows, highlightIndex } = useMemo(() => {
    const periods = Array.from(new Set([1, 3, 5, 10, 20, base]))
      .filter((y) => Number.isFinite(y) && y > 0)
      .sort((a, b) => a - b);

    const built = periods.map((years) => {
      const r = compute({ ...form, years: String(years) });
      return {
        years,
        annualized: r?.annualizedPct ?? 0,
        gain: r?.totalGain ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.years === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "years", label: "Holding period (yr)", format: (v) => String(v) },
    { key: "annualized", label: "Annualized (CAGR)", align: "right", format: (v) => formatPct(Number(v)) },
    { key: "gain", label: "Total gain", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the holding period were different?"
      caption="Same beginning and ending values — only the number of years changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="annualized-return-scenarios"
    />
  );
}
