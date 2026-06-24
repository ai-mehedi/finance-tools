"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeGrossToNet,
  formatUSD,
  formatCompact,
  type PayPeriod,
  type GrossToNetResult,
} from "@/lib/calculators/gross-to-net";

const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
];

type FormState = {
  grossAnnual: string;
  taxRatePct: string;
  retirementPct: string;
  otherDeductions: string;
  payPeriod: PayPeriod;
};

const DEFAULTS: FormState = {
  grossAnnual: "75000",
  taxRatePct: "22",
  retirementPct: "6",
  otherDeductions: "2400",
  payPeriod: "monthly",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GrossToNetResult | null {
  return computeGrossToNet({
    grossAnnual: num(f.grossAnnual),
    taxRatePct: num(f.taxRatePct) || 0,
    retirementPct: num(f.retirementPct) || 0,
    otherDeductions: num(f.otherDeductions) || 0,
    payPeriod: f.payPeriod,
  });
}

export default function GrossToNetCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a gross salary above 0 with tax and retirement rates between 0 and 100."
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
        { label: "Gross salary", value: result.grossAnnual, color: "bg-zinc-300" },
        { label: "Retirement", value: result.retirement, color: "bg-orange-200" },
        { label: "Income tax", value: result.incomeTax, color: "bg-orange-300" },
        { label: "Other deductions", value: result.otherDeductions, color: "bg-zinc-400" },
        { label: "Take-home pay", value: result.netAnnual, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your salary and deductions, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="gross">Gross annual salary</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="gross" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.grossAnnual} onChange={(e) => set("grossAnnual", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tax">Income tax (%)</Label>
                <Input id="tax" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retire">Retirement (%)</Label>
                <Input id="retire" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.retirementPct} onChange={(e) => set("retirementPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="other">Other deductions / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="other" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.otherDeductions} onChange={(e) => set("otherDeductions", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="period">Show pay as</Label>
                <Select id="period" className="h-11" value={form.payPeriod} onChange={(e) => set("payPeriod", e.target.value as PayPeriod)}>
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Take-home pay {result ? result.periodLabel : ""}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netPerPeriod) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {formatUSD(result.netAnnual)} a year · {result.takeHomePct.toFixed(1)}% of gross
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

      {result && result.slices.length > 0 && <SalaryDonut result={result} />}

      {/* What-if: how take-home pay changes across different gross salary levels. */}
      {result && <SalaryScenarios form={form} />}
    </div>
  );
}

/** Sweeps the gross annual salary so the user sees take-home pay and effective
 *  take-home % at several salary levels plus their own value. */
function SalaryScenarios({ form }: { form: FormState }) {
  const base = num(form.grossAnnual) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const salaries = Array.from(
      new Set([40000, 60000, 75000, 100000, 150000, base]),
    )
      .filter((s) => s > 0)
      .sort((a, b) => a - b);

    const built = salaries.map((gross) => {
      const r = compute({ ...form, grossAnnual: String(gross) });
      return {
        gross,
        net: r?.netAnnual ?? 0,
        pct: r ? `${r.takeHomePct.toFixed(1)}%` : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.gross === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "gross", label: "Gross salary / yr", format: (v) => formatUSD(Number(v)) },
    { key: "net", label: "Take-home / yr", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "pct", label: "Of gross", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if your salary were different?"
      caption="Same tax and deduction settings — only the gross salary changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="gross-to-net-salary-scenarios"
    />
  );
}

function SalaryDonut({ result }: { result: GrossToNetResult }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const stroke = 28;
  const circ = 2 * Math.PI * r;

  const total = result.slices.reduce((s, d) => s + d.value, 0) || 1;

  let offset = 0;
  const arcs = result.slices.map((d) => {
    const frac = d.value / total;
    const dash = frac * circ;
    const seg = { color: d.color, dash, gap: circ - dash, rot: (offset / total) * 360 };
    offset += d.value;
    return seg;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your salary goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0" role="img" aria-label="Salary breakdown donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.dash.toFixed(2)} ${a.gap.toFixed(2)}`}
              transform={`rotate(${a.rot - 90} ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={20} fontWeight={800}>
            {result.takeHomePct.toFixed(0)}%
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={11}>take-home</text>
        </svg>
        <ul className="w-full space-y-2">
          {result.slices.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-bold tabular-nums text-zinc-900">{formatCompact(s.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
