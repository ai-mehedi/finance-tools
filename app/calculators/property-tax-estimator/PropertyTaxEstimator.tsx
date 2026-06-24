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
  formatPct,
  type RateUnit,
  type PropertyTaxResult,
} from "@/lib/calculators/property-tax-estimator";

const RATE_UNITS: { value: RateUnit; label: string }[] = [
  { value: "percent", label: "Percent (%)" },
  { value: "mills", label: "Mills (per $1k)" },
];

type FormState = {
  assessedValue: string;
  exemption: string;
  rate: string;
  rateUnit: RateUnit;
  appreciationPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  assessedValue: "350000",
  exemption: "25000",
  rate: "1.1",
  rateUnit: "percent",
  appreciationPct: "3",
  years: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PropertyTaxResult | null {
  return computePropertyTax({
    assessedValue: num(f.assessedValue),
    exemption: num(f.exemption) || 0,
    rate: num(f.rate),
    rateUnit: f.rateUnit,
    appreciationPct: num(f.appreciationPct) || 0,
    years: num(f.years),
  });
}

export default function PropertyTaxEstimator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter an assessed value and number of years greater than 0, with a non-negative rate and exemption."
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
        { label: "Monthly tax", value: formatUSD(result.monthlyTax) },
        { label: "Taxable value", value: formatUSD(result.taxableValue) },
        { label: "Effective rate", value: formatPct(result.effectiveRatePct) },
        { label: `Total over ${form.years || "0"} years`, value: formatUSD(result.totalOverHorizon) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the property details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="assessed">Assessed value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="assessed" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.assessedValue} onChange={(e) => set("assessedValue", e.target.value)} />
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
                <Label htmlFor="rate">Tax rate</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.rate} onChange={(e) => set("rate", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="unit">Rate unit</Label>
                <Select id="unit" className="h-11" value={form.rateUnit} onChange={(e) => set("rateUnit", e.target.value as RateUnit)}>
                  {RATE_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="appr">Annual value growth (%)</Label>
                <Input id="appr" type="number" step="any" inputMode="decimal" className="h-11" value={form.appreciationPct} onChange={(e) => set("appreciationPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years to project</Label>
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
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
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

/** Sweeps the tax rate so the user sees the annual + monthly bill and lifetime
 *  total at a spread of rates around their own value. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.rate);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = form.rateUnit === "mills"
      ? [5, 8, 10, 12, 15, base]
      : [0.5, 0.8, 1.1, 1.5, 2, base];

    const rates = Array.from(new Set(candidates))
      .filter((r) => Number.isFinite(r) && r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, rate: String(rate) });
      return {
        rate,
        annual: r?.annualTax ?? 0,
        monthly: r?.monthlyTax ?? 0,
        total: r?.totalOverHorizon ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const unitLabel = form.rateUnit === "mills" ? "Rate (mills)" : "Rate (%)";

  const columns: GridColumn[] = [
    { key: "rate", label: unitLabel, format: (v) => (form.rateUnit === "mills" ? String(v) : formatPct(Number(v))) },
    { key: "annual", label: "Annual tax", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "monthly", label: "Monthly tax", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "total", label: `Total over ${form.years || "0"} yrs`, align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the tax rate changed?"
      caption="Same property — only the tax rate changes."
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
  const lastYear = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.tax)) || 1;

  const x = (yr: number) => pad.l + ((yr - 1) / (lastYear - 1 || 1)) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const taxPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.tax).toFixed(1)}`);
  const areaPath = `M${x(1)},${y(0)} L${taxPts.join(" L")} L${x(lastYear)},${y(0)} Z`;
  const taxLine = `M${taxPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [1, Math.round((1 + lastYear) / 2), lastYear].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Estimated tax by year</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Annual tax</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Property tax projection chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="ptFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#ptFill)" />
        <path d={taxLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>yr {t}</text>
        ))}
      </svg>
    </div>
  );
}
