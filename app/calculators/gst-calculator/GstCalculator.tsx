"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeGst,
  formatUSD,
  GST_SLABS,
  type GstMode,
  type SupplyType,
  type GstResult,
} from "@/lib/calculators/gst";

type FormState = {
  amount: string;
  ratePct: string;
  mode: GstMode;
  supply: SupplyType;
};

const DEFAULTS: FormState = {
  amount: "10000",
  ratePct: "18",
  mode: "exclusive",
  supply: "intra",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GstResult | null {
  return computeGst({
    amount: num(f.amount),
    ratePct: num(f.ratePct),
    mode: f.mode,
    supply: f.supply,
  });
}

export default function GstCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a non-negative amount and a valid GST rate." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const breakdown = result
    ? [
        { label: "Net (taxable) amount", value: result.baseAmount, color: "bg-zinc-300" },
        result.supply === "intra"
          ? { label: `CGST (${result.ratePct / 2}%)`, value: result.cgst, color: "bg-orange-300" }
          : { label: `IGST (${result.ratePct}%)`, value: result.igst, color: "bg-orange-300" },
        ...(result.supply === "intra"
          ? [{ label: `SGST (${result.ratePct / 2}%)`, value: result.sgst, color: "bg-orange-500" }]
          : []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the amount and rate, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">GST rate (%)</Label>
                <Select id="rate" className="h-11" value={form.ratePct} onChange={(e) => set("ratePct", e.target.value)}>
                  {GST_SLABS.map((s) => (
                    <option key={s} value={String(s)}>{s}%</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mode">Amount type</Label>
                <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as GstMode)}>
                  <option value="exclusive">Exclusive of GST</option>
                  <option value="inclusive">Inclusive of GST</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="supply">Supply type</Label>
                <Select id="supply" className="h-11" value={form.supply} onChange={(e) => set("supply", e.target.value as SupplyType)}>
                  <option value="intra">Intra-state (CGST + SGST)</option>
                  <option value="inter">Inter-state (IGST)</option>
                </Select>
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
            {result && form.mode === "inclusive" ? "GST included" : "Total with GST"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(form.mode === "inclusive" ? result.gstAmount : result.totalAmount) : "—"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {result ? `GST amount: ${formatUSD(result.gstAmount)}` : ""}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Split donut */}
      {result && result.gstAmount > 0 && <SplitDonut result={result} />}

      {/* What-if: how the GST amount and total change across the standard rate slabs. */}
      {result && <RateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the GST rate across the standard slabs (plus the user's chosen rate)
 *  so they can compare the GST charged and the gross total at each rate. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.ratePct);

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([...GST_SLABS, Number.isFinite(base) ? base : 18]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, ratePct: String(rate) });
      return {
        rate,
        gst: r?.gstAmount ?? 0,
        total: r?.totalAmount ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "GST rate", format: (v) => `${Number(v)}%` },
    { key: "gst", label: "GST amount", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "total", label: "Total with GST", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the GST rate were different?"
      caption="Same amount and supply type — only the GST rate slab changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="gst-rate-scenarios"
    />
  );
}

function SplitDonut({ result }: { result: GstResult }) {
  const total = result.totalAmount || 1;
  const segments =
    result.supply === "intra"
      ? [
          { label: "Net amount", value: result.baseAmount, color: "#a1a1aa" },
          { label: "CGST", value: result.cgst, color: "#fb923c" },
          { label: "SGST", value: result.sgst, color: "#f97316" },
        ]
      : [
          { label: "Net amount", value: result.baseAmount, color: "#a1a1aa" },
          { label: "IGST", value: result.igst, color: "#f97316" },
        ];

  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Price breakup</h3>
      <div className="flex flex-wrap items-center gap-6">
        <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="GST price breakup donut chart">
          <g transform="translate(90 90) rotate(-90)">
            <circle r={R} fill="none" stroke="#f4f4f5" strokeWidth={22} />
            {segments.map((s, idx) => {
              const frac = s.value / total;
              const dash = frac * C;
              const el = (
                <circle
                  key={idx}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={22}
                  strokeDasharray={`${dash.toFixed(2)} ${(C - dash).toFixed(2)}`}
                  strokeDashoffset={(-offset).toFixed(2)}
                />
              );
              offset += dash;
              return el;
            })}
          </g>
        </svg>
        <ul className="space-y-2 text-sm">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="font-medium text-zinc-600">{s.label}</span>
              <span className="font-bold tabular-nums text-zinc-900">{formatUSD(s.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
