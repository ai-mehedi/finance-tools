"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeDividendYield,
  formatUSD,
  formatPct,
  type DividendYieldResult,
} from "@/lib/calculators/dividend-yield";

type FormState = {
  sharePrice: string;
  annualDividend: string;
  shares: string;
  costBasis: string;
};

const DEFAULTS: FormState = {
  sharePrice: "100",
  annualDividend: "4",
  shares: "200",
  costBasis: "80",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DividendYieldResult | null {
  return computeDividendYield({
    sharePrice: num(f.sharePrice) || 0,
    annualDividend: num(f.annualDividend) || 0,
    shares: num(f.shares) || 0,
    costBasis: num(f.costBasis) || 0,
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

export default function DividendYieldCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a share price greater than 0 and non-negative amounts." : null;

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
        <h2 className="text-base font-extrabold text-zinc-900">Stock details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Money id="price" label="Share price" value={form.sharePrice} onChange={(v) => set("sharePrice", v)} />
            <Money id="dividend" label="Annual dividend / share" value={form.annualDividend} onChange={(v) => set("annualDividend", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shares">Shares held</Label>
              <Input id="shares" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.shares} onChange={(e) => set("shares", e.target.value)} />
            </div>
            <Money id="cost" label="Cost basis / share" value={form.costBasis} onChange={(v) => set("costBasis", v)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Dividend yield</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatPct(result.dividendYieldPct) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Yield on cost</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.yieldOnCostPct)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Annual income</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualIncome)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Monthly income</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Position value</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.positionValue)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </div>
    </form>

      {/* What-if: how the dividend yield and income change at different share prices. */}
      {result && <SharePriceScenarios form={form} />}
    </div>
  );
}

/** Sweeps the share price so the user sees how dividend yield and annual income
 *  shift as the stock's price moves, around their own entered price. */
function SharePriceScenarios({ form }: { form: FormState }) {
  const base = num(form.sharePrice) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [base * 0.75, base * 0.9, base, base * 1.1, base * 1.25, base * 1.5]
      .map((p) => Math.round(p * 100) / 100)
      .filter((p) => p > 0);
    const prices = Array.from(new Set(candidates)).sort((a, b) => a - b);

    const built = prices.map((price) => {
      const r = compute({ ...form, sharePrice: String(price) });
      return {
        price,
        yield: r?.dividendYieldPct ?? 0,
        annualIncome: r?.annualIncome ?? 0,
        positionValue: r?.positionValue ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.price === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "price", label: "Share price", format: (v) => formatUSD(Number(v)) },
    { key: "yield", label: "Dividend yield", align: "right", format: (v) => formatPct(Number(v)) },
    { key: "annualIncome", label: "Annual income", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "positionValue", label: "Position value", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the share price moves?"
      caption="Same dividend & shares — only the share price changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="dividend-yield-share-price-scenarios"
    />
  );
}
