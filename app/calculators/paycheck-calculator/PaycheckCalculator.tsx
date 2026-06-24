"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computePaycheck,
  formatUSD,
  type PayFrequency,
  type PaycheckResult,
} from "@/lib/calculators/paycheck";

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

type FormState = {
  annualSalary: string;
  payFrequency: PayFrequency;
  preTaxPct: string;
  federalRatePct: string;
  stateRatePct: string;
};

const DEFAULTS: FormState = {
  annualSalary: "65000",
  payFrequency: "biweekly",
  preTaxPct: "5",
  federalRatePct: "12",
  stateRatePct: "4",
};

const SLICE_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#a1a1aa", "#d4d4d8"];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PaycheckResult | null {
  return computePaycheck({
    annualSalary: num(f.annualSalary),
    payFrequency: f.payFrequency,
    preTaxPct: num(f.preTaxPct) || 0,
    federalRatePct: num(f.federalRatePct) || 0,
    stateRatePct: num(f.stateRatePct) || 0,
  });
}

export default function PaycheckCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a salary greater than 0, a pre-tax percent under 100 and non-negative tax rates."
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
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salary">Annual salary</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualSalary} onChange={(e) => set("annualSalary", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="freq">Pay frequency</Label>
                <Select id="freq" className="h-11" value={form.payFrequency} onChange={(e) => set("payFrequency", e.target.value as PayFrequency)}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pretax">401k (% gross)</Label>
                <Input id="pretax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.preTaxPct} onChange={(e) => set("preTaxPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="fed">Federal (%)</Label>
                <Input id="fed" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.federalRatePct} onChange={(e) => set("federalRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="state">State (%)</Label>
                <Input id="state" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stateRatePct} onChange={(e) => set("stateRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Take-home per paycheck</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netPerPaycheck) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.takeHomePct.toFixed(1)}% of gross · {formatUSD(result.annualNet)} a year
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              result.slices.map((s, i) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                    {s.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(s.perPaycheck)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Allocation donut */}
      {result && <PaycheckDonut result={result} />}

      {/* What-if: how different 401(k) contribution rates change take-home pay. */}
      {result && <PreTaxScenarios form={form} />}
    </div>
  );
}

/** Sweeps the 401(k) contribution rate so the user sees how take-home pay per
 *  paycheck (and yearly) shifts at 0% / 3% / 5% / 10% / 15% plus their own value. */
function PreTaxScenarios({ form }: { form: FormState }) {
  const base = num(form.preTaxPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const pcts = Array.from(new Set([0, 3, 5, 10, 15, base]))
      .filter((p) => p >= 0 && p < 100)
      .sort((a, b) => a - b);

    const built = pcts.map((pct) => {
      const r = compute({ ...form, preTaxPct: String(pct) });
      return {
        pct,
        net: r?.netPerPaycheck ?? 0,
        annualNet: r?.annualNet ?? 0,
        takeHomePct: r ? `${r.takeHomePct.toFixed(1)}%` : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.pct === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "pct", label: "401(k) %", format: (v) => `${Number(v)}%` },
    { key: "net", label: "Take-home / check", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "annualNet", label: "Take-home / year", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "takeHomePct", label: "Of gross", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you changed your 401(k) contribution?"
      caption="Same salary and tax rates — only the pre-tax 401(k) percent changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="paycheck-401k-scenarios"
    />
  );
}

function PaycheckDonut({ result }: { result: PaycheckResult }) {
  const slices = result.slices.filter((s) => s.annual > 0);
  const total = slices.reduce((sum, s) => sum + s.annual, 0) || 1;

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 78;
  const stroke = 30;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const frac = s.annual / total;
    const dash = frac * circumference;
    const arc = {
      label: s.label,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      dasharray: `${dash} ${circumference - dash}`,
      dashoffset: -offset,
      pct: frac * 100,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where each gross dollar goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label="Paycheck allocation donut chart">
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.dashoffset}
            />
          ))}
        </svg>
        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {arcs.map((a) => (
            <li key={a.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                {a.label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">{a.pct.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
