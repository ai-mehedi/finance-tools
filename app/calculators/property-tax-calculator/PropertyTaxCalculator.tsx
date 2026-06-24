"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computePropertyTax,
  formatUSD,
  formatCompact,
  type RateMode,
  type PropertyTaxResult,
} from "@/lib/calculators/property-tax";

const RATE_MODES: { value: RateMode; label: string }[] = [
  { value: "percent", label: "Percent (%)" },
  { value: "mills", label: "Mill rate" },
];

type FormState = {
  marketValue: string;
  assessmentRatioPct: string;
  exemption: string;
  rate: string;
  rateMode: RateMode;
  appreciationPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  marketValue: "350000",
  assessmentRatioPct: "100",
  exemption: "25000",
  rate: "1.1",
  rateMode: "percent",
  appreciationPct: "3",
  years: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PropertyTaxResult | null {
  return computePropertyTax({
    marketValue: num(f.marketValue),
    assessmentRatioPct: num(f.assessmentRatioPct),
    exemption: num(f.exemption) || 0,
    rate: num(f.rate) || 0,
    rateMode: f.rateMode,
    appreciationPct: num(f.appreciationPct) || 0,
    years: num(f.years),
  });
}

export default function PropertyTaxCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a market value above 0, an assessment ratio above 0, and valid rate and years."
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

  const breakdown = result
    ? [
        { label: "Assessed value", value: result.assessedValue, color: "bg-zinc-300" },
        { label: "Taxable value", value: result.taxableValue, color: "bg-orange-300" },
        { label: "Annual tax", value: result.annualTax, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Property details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your home and rate details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="market">Market value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="market" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.marketValue} onChange={(e) => set("marketValue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="exemption">Exemption</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="exemption" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.exemption} onChange={(e) => set("exemption", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ratio">Assessment ratio (%)</Label>
                <Input id="ratio" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.assessmentRatioPct} onChange={(e) => set("assessmentRatioPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mode">Rate type</Label>
                <Select id="mode" className="h-11" value={form.rateMode} onChange={(e) => set("rateMode", e.target.value as RateMode)}>
                  {RATE_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rate">{form.rateMode === "mills" ? "Mill rate" : "Tax rate (%)"}</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.rate} onChange={(e) => set("rate", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="appr">Appreciation (%/yr)</Label>
                <Input id="appr" type="number" step="any" inputMode="decimal" className="h-11" value={form.appreciationPct} onChange={(e) => set("appreciationPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated annual tax</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.annualTax) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {formatUSD(result.monthlyTax)} / month · {result.effectiveRatePct.toFixed(2)}% of market value
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
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Projection chart */}
      {result && result.schedule.length > 1 && <TaxChart result={result} />}

      {/* What-if: how different tax rates change the annual bill. */}
      {result && <RateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the tax rate so the user sees the annual bill and effective rate at a
 *  spread of common rates plus their own value. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.rate) || 0;
  const isMills = form.rateMode === "mills";

  const { rows, highlightIndex } = useMemo(() => {
    const sample = isMills ? [5, 10, 15, 20, 25] : [0.5, 1, 1.5, 2, 2.5];
    const rates = Array.from(new Set([...sample, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, rate: String(rate) });
      return {
        rate,
        annual: r?.annualTax ?? 0,
        effective: r ? r.effectiveRatePct : 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base, isMills]);

  const columns: GridColumn[] = [
    {
      key: "rate",
      label: isMills ? "Mill rate" : "Tax rate (%)",
      format: (v) => (isMills ? `${Number(v)}` : `${Number(v)}%`),
    },
    { key: "annual", label: "Annual tax", align: "right", format: (v) => formatUSD(Number(v)) },
    {
      key: "effective",
      label: "% of market value",
      align: "right",
      format: (v) => `${Number(v).toFixed(2)}%`,
    },
  ];

  return (
    <ScenarioGrid
      title="What if your tax rate were different?"
      caption="Same home and exemption — only the tax rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="property-tax-rate-scenarios"
    />
  );
}

function TaxChart({ result }: { result: PropertyTaxResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const maxVal = Math.max(...data.map((p) => p.annualTax)) || 1;

  const barW = (innerW / n) * 0.62;
  const x = (i: number) => pad.l + (i + 0.5) * (innerW / n);
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  const lastYear = data[data.length - 1].year || 1;
  const tickEvery = Math.max(1, Math.round(n / 6));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Projected annual tax</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Tax bill</span>
          <span className="text-zinc-400">over {lastYear} yr</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected property tax chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="ptFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const h = pad.t + innerH - y(p.annualTax);
          return (
            <rect
              key={i}
              x={x(i) - barW / 2}
              y={y(p.annualTax)}
              width={barW}
              height={Math.max(0, h)}
              rx={2}
              fill="url(#ptFill)"
            />
          );
        })}
        {data.map((p, i) =>
          i % tickEvery === 0 || i === n - 1 ? (
            <text key={`t${i}`} x={x(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.year} yr</text>
          ) : null
        )}
      </svg>
    </div>
  );
}
