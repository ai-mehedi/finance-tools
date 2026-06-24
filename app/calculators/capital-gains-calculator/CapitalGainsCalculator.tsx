"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeCapitalGains,
  formatUSD,
  type CapitalGainsResult,
} from "@/lib/calculators/capital-gains";

type Term = "long" | "short";

type FormState = {
  purchasePrice: string;
  salePrice: string;
  sellingCosts: string;
  taxRatePct: string;
  term: Term;
};

const DEFAULTS: FormState = {
  purchasePrice: "10000",
  salePrice: "15000",
  sellingCosts: "100",
  taxRatePct: "15",
  term: "long",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CapitalGainsResult | null {
  return computeCapitalGains({
    purchasePrice: num(f.purchasePrice) || 0,
    salePrice: num(f.salePrice) || 0,
    sellingCosts: num(f.sellingCosts) || 0,
    taxRatePct: num(f.taxRatePct) || 0,
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

export default function CapitalGainsCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter non-negative amounts and a valid tax rate." : null;

  function onTermChange(t: Term) {
    // Suggest a typical default rate for the chosen holding period.
    const rate = t === "long" ? "15" : "24";
    set("term", t);
    set("taxRatePct", rate);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const breakdown = result && result.isGain
    ? [
        { label: "After-tax profit", value: result.afterTaxProfit, color: "bg-orange-500" },
        { label: "Capital gains tax", value: result.taxOwed, color: "bg-amber-300" },
      ].filter((b) => b.value > 0)
    : [];
  const breakdownTotal = breakdown.reduce((s, b) => s + b.value, 0);

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Sale details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="purchase" label="Purchase price (basis)" value={form.purchasePrice} onChange={(v) => set("purchasePrice", v)} />
              <Money id="sale" label="Sale price" value={form.salePrice} onChange={(v) => set("salePrice", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Money id="costs" label="Selling costs" value={form.sellingCosts} onChange={(v) => set("sellingCosts", v)} />
              <div>
                <Label htmlFor="term">Holding period</Label>
                <Select id="term" className="h-11" value={form.term} onChange={(e) => onTermChange(e.target.value as Term)}>
                  <option value="long">Long term</option>
                  <option value="short">Short term</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="rate">Tax rate (%)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {result && !result.isGain ? "Capital loss" : "After-tax profit"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.afterTaxProfit) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Capital gain</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.capitalGain)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tax owed</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.taxOwed)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Net proceeds <span className="font-semibold text-zinc-600">{formatUSD(result.netProceeds)}</span> · After-tax return{" "}
              <span className="font-semibold text-zinc-600">{result.returnPct.toFixed(1)}%</span> on cost basis.
            </p>
          )}
        </div>
      </form>

      {breakdown.length > 0 && <GainSplitChart breakdown={breakdown} total={breakdownTotal} />}

      {/* What-if: how different capital gains tax rates change the tax and your take-home. */}
      {result && <TaxRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the capital gains tax rate so the user sees the tax owed and
 *  after-tax profit at 0% / 10% / 15% / 20% / 24% / 37% plus their own rate. */
function TaxRateScenarios({ form }: { form: FormState }) {
  const base = num(form.taxRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([0, 10, 15, 20, 24, 37, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, taxRatePct: String(rate) });
      return {
        rate,
        taxOwed: r?.taxOwed ?? 0,
        afterTaxProfit: r?.afterTaxProfit ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Tax rate", format: (v) => `${Number(v)}%` },
    { key: "taxOwed", label: "Tax owed", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "afterTaxProfit", label: "After-tax profit", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your tax rate were different?"
      caption="Same sale — only the capital gains tax rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="capital-gains-tax-rate-scenarios"
    />
  );
}

function GainSplitChart({ breakdown, total }: { breakdown: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">How your gain splits</h3>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100">
        {breakdown.map((b) => (
          <div
            key={b.label}
            className={b.color}
            style={{ width: `${total > 0 ? (b.value / total) * 100 : 0}%` }}
            title={`${b.label}: ${formatUSD(b.value)}`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-zinc-500">
              <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
              {b.label}
            </span>
            <span className="font-bold tabular-nums text-zinc-900">
              {formatUSD(b.value)} <span className="font-medium text-zinc-400">({total > 0 ? ((b.value / total) * 100).toFixed(1) : "0"}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
