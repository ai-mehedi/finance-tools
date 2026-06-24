"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSalesTax,
  formatUSD2,
  formatCompact,
  type TaxMode,
  type SalesTaxResult,
} from "@/lib/calculators/sales-tax";

const MODES: { value: TaxMode; label: string }[] = [
  { value: "add", label: "Add tax to price" },
  { value: "extract", label: "Remove tax from total" },
];

type FormState = {
  amount: string;
  taxRatePct: string;
  mode: TaxMode;
};

const DEFAULTS: FormState = {
  amount: "100",
  taxRatePct: "7.25",
  mode: "add",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SalesTaxResult | null {
  return computeSalesTax({
    amount: num(f.amount),
    taxRatePct: num(f.taxRatePct),
    mode: f.mode,
  });
}

export default function SalesTaxCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a non-negative amount and a tax rate between 0 and 100 percent."
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

  const isAdd = form.mode === "add";

  const breakdown = result
    ? [
        { label: "Net price (before tax)", value: result.netAmount, color: "bg-zinc-300" },
        { label: `Sales tax (${result.taxRatePct}%)`, value: result.taxAmount, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Choose a direction, enter the figures, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="mode">Calculation</Label>
              <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as TaxMode)}>
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">{isAdd ? "Price before tax" : "Total including tax"}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Sales tax rate (%)</Label>
                <Input id="rate" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{isAdd ? "Total with tax" : "Price before tax"}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(isAdd ? result.grossAmount : result.netAmount) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Tax of {formatUSD2(result.taxAmount)}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
            {result && (
              <div className="flex items-center justify-between rounded-lg bg-orange-500/10 px-3 py-2.5">
                <span className="text-sm font-bold text-orange-700">Gross total</span>
                <span className="text-sm font-extrabold tabular-nums text-orange-700">{formatUSD2(result.grossAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Net-vs-tax donut */}
      {result && result.grossAmount > 0 && <TaxDonut result={result} />}

      {/* What-if: how different tax rates change the tax and total. */}
      {result && <TaxRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the sales tax rate so the user sees the tax amount and total at a
 *  spread of common rates plus their own entered rate. */
function TaxRateScenarios({ form }: { form: FormState }) {
  const base = num(form.taxRatePct);

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([0, 5, 7.25, 8.5, 10, base]))
      .filter((r) => Number.isFinite(r) && r >= 0 && r <= 100)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, taxRatePct: String(rate) });
      return {
        rate,
        tax: r?.taxAmount ?? 0,
        total: r?.grossAmount ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Tax rate", format: (v) => `${Number(v)}%` },
    { key: "tax", label: "Sales tax", align: "right", format: (v) => formatUSD2(Number(v)) },
    { key: "total", label: "Total with tax", align: "right", format: (v) => formatUSD2(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the tax rate were different?"
      caption="Same amount — only the sales tax rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="sales-tax-rate-scenarios"
    />
  );
}

function TaxDonut({ result }: { result: SalesTaxResult }) {
  const total = result.grossAmount || 1;
  const netFrac = result.netAmount / total;
  const taxFrac = result.taxAmount / total;

  const R = 70;
  const C = 2 * Math.PI * R;
  const netLen = C * netFrac;
  const taxLen = C * taxFrac;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where each dollar goes</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /> Net price</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Sales tax</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 200 200" className="h-44 w-44 -rotate-90" role="img" aria-label="Net price versus sales tax donut chart">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#e4e4e7" strokeWidth={26} />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="#d4d4d8"
            strokeWidth={26}
            strokeDasharray={`${netLen.toFixed(1)} ${(C - netLen).toFixed(1)}`}
            strokeDashoffset={0}
          />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="#f97316"
            strokeWidth={26}
            strokeDasharray={`${taxLen.toFixed(1)} ${(C - taxLen).toFixed(1)}`}
            strokeDashoffset={-netLen}
          />
        </svg>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Net price</p>
            <p className="text-lg font-extrabold text-zinc-900 tabular-nums">{formatUSD2(result.netAmount)} <span className="text-sm font-semibold text-zinc-400">({(netFrac * 100).toFixed(1)}%)</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Sales tax</p>
            <p className="text-lg font-extrabold text-zinc-900 tabular-nums">{formatUSD2(result.taxAmount)} <span className="text-sm font-semibold text-zinc-400">({(taxFrac * 100).toFixed(1)}%)</span></p>
          </div>
          <p className="text-xs text-zinc-400">Total {formatCompact(result.grossAmount)}</p>
        </div>
      </div>
    </div>
  );
}
