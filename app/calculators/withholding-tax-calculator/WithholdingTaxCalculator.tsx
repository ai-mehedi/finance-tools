"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeWithholding,
  formatUSD,
  formatCompact,
  type PayFrequency,
  type FilingStatus,
  type WithholdingResult,
} from "@/lib/calculators/withholding-tax";

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

const STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
];

type FormState = {
  grossPerPeriod: string;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  allowances: string;
  preTaxPerPeriod: string;
  extraPerPeriod: string;
};

const DEFAULTS: FormState = {
  grossPerPeriod: "2500",
  payFrequency: "biweekly",
  filingStatus: "single",
  allowances: "0",
  preTaxPerPeriod: "150",
  extraPerPeriod: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): WithholdingResult | null {
  return computeWithholding({
    grossPerPeriod: num(f.grossPerPeriod),
    payFrequency: f.payFrequency,
    filingStatus: f.filingStatus,
    allowances: num(f.allowances) || 0,
    preTaxPerPeriod: num(f.preTaxPerPeriod) || 0,
    extraPerPeriod: num(f.extraPerPeriod) || 0,
  });
}

export default function WithholdingTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<WithholdingResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter gross pay above 0, with pre-tax deductions smaller than gross pay and non-negative values.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setForm(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  const breakdown = result
    ? [
        { label: "Take-home per paycheck", value: result.netPerPeriod, color: "bg-orange-500" },
        { label: "Annual tax owed", value: result.annualTaxOwed, color: "bg-orange-300" },
        { label: "Annual withheld", value: result.annualWithheld, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Paycheck details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in your pay, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gross">Gross pay / period</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="gross" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.grossPerPeriod} onChange={(e) => set("grossPerPeriod", e.target.value)} />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="status">Filing status</Label>
                <Select id="status" className="h-11" value={form.filingStatus} onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="allow">Allowances</Label>
                <Input id="allow" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.allowances} onChange={(e) => set("allowances", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pretax">Pre-tax / period</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pretax" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.preTaxPerPeriod} onChange={(e) => set("preTaxPerPeriod", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="extra">Extra withholding</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="extra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.extraPerPeriod} onChange={(e) => set("extraPerPeriod", e.target.value)} />
                </div>
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Withheld per paycheck</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.perPeriodWithholding) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Effective rate {result.effectiveRatePct.toFixed(1)}% · marginal {result.marginalRatePct.toFixed(0)}%
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
          {result && (
            <p className="mt-3 rounded-lg bg-white/70 px-3 py-2.5 text-xs font-semibold text-zinc-600">
              {result.refundOrDue >= 0
                ? `On track for about ${formatUSD(result.refundOrDue)} back at tax time.`
                : `Heading toward roughly ${formatUSD(-result.refundOrDue)} owed at tax time.`}
            </p>
          )}
        </div>
      </form>

      {/* Bracket chart */}
      {result && result.brackets.length > 0 && <BracketChart result={result} />}
    </div>
  );
}

function BracketChart({ result }: { result: WithholdingResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.brackets;
  const maxTax = Math.max(...data.map((b) => b.tax)) || 1;
  const n = data.length;
  const slot = innerW / n;
  const barW = Math.min(48, slot * 0.6);

  const y = (v: number) => pad.t + innerH - (v / maxTax) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxTax / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Tax by bracket</h3>
        <span className="text-xs text-zinc-500">Annual tax owed per marginal band</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Withholding tax by bracket chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((b, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(b.tax);
          const h = pad.t + innerH - top;
          return (
            <g key={i}>
              <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(0, h)} rx={4} fill="#f97316" />
              <text x={cx} y={H - 18} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{(b.rate * 100).toFixed(0)}%</text>
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-zinc-400" fontSize={9}>{formatCompact(b.tax)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
