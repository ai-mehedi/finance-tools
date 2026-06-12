"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeTakeHomePay,
  formatUSD,
  formatCompact,
  PERIOD_LABEL,
  type FilingStatus,
  type PayPeriod,
  type TakeHomePayResult,
} from "@/lib/calculators/take-home-pay";

const STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head", label: "Head of household" },
];

const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "annually", label: "Annually" },
  { value: "monthly", label: "Monthly" },
  { value: "semimonthly", label: "Semi-monthly (24/yr)" },
  { value: "biweekly", label: "Bi-weekly (26/yr)" },
  { value: "weekly", label: "Weekly" },
];

type FormState = {
  grossAnnualSalary: string;
  filingStatus: FilingStatus;
  stateTaxRatePct: string;
  pretaxDeductionsAnnual: string;
  payPeriod: PayPeriod;
};

const DEFAULTS: FormState = {
  grossAnnualSalary: "75000",
  filingStatus: "single",
  stateTaxRatePct: "5",
  pretaxDeductionsAnnual: "6000",
  payPeriod: "biweekly",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TakeHomePayResult | null {
  return computeTakeHomePay({
    grossAnnualSalary: num(f.grossAnnualSalary),
    filingStatus: f.filingStatus,
    stateTaxRatePct: num(f.stateTaxRatePct) || 0,
    pretaxDeductionsAnnual: num(f.pretaxDeductionsAnnual) || 0,
    payPeriod: f.payPeriod,
  });
}

export default function TakeHomePayCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TakeHomePayResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a gross salary above 0, non-negative rates, and deductions no larger than salary.");
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your paycheck details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the fields, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="gross">Gross annual salary</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="gross" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.grossAnnualSalary} onChange={(e) => set("grossAnnualSalary", e.target.value)} />
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
                <Label htmlFor="period">Show pay</Label>
                <Select id="period" className="h-11" value={form.payPeriod} onChange={(e) => set("payPeriod", e.target.value as PayPeriod)}>
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="state">State tax (% / yr)</Label>
                <Input id="state" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stateTaxRatePct} onChange={(e) => set("stateTaxRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pretax">Pre-tax deductions</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pretax" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.pretaxDeductionsAnnual} onChange={(e) => set("pretaxDeductionsAnnual", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Take-home pay</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netPerPeriod) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {PERIOD_LABEL[result.payPeriod]} &middot; {formatUSD(result.netAnnual)} a year
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Take-home rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{(result.takeHomeRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total withheld</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalWithheld)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Breakdown chart */}
      {result && result.slices.length > 1 && <WithholdingChart result={result} />}
    </div>
  );
}

function WithholdingChart({ result }: { result: TakeHomePayResult }) {
  const W = 640;
  const H = 280;
  const cx = 150;
  const cy = 140;
  const rOuter = 110;
  const rInner = 64;

  const total = result.grossAnnual || 1;
  const palette = ["#f97316", "#fb923c", "#fcd34d", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

  let acc = 0;
  const arcs = result.slices.map((s, i) => {
    const start = (acc / total) * Math.PI * 2;
    acc += s.value;
    const end = (acc / total) * Math.PI * 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + rOuter * Math.sin(start);
    const y1 = cy - rOuter * Math.cos(start);
    const x2 = cx + rOuter * Math.sin(end);
    const y2 = cy - rOuter * Math.cos(end);
    const xi2 = cx + rInner * Math.sin(end);
    const yi2 = cy - rInner * Math.cos(end);
    const xi1 = cx + rInner * Math.sin(start);
    const yi1 = cy - rInner * Math.cos(start);
    const d = `M${x1.toFixed(1)},${y1.toFixed(1)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${rInner},${rInner} 0 ${large} 0 ${xi1.toFixed(1)},${yi1.toFixed(1)} Z`;
    return { d, color: palette[i % palette.length], label: s.label, value: s.value };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where each gross dollar goes</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Paycheck withholding breakdown">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color} stroke="#fff" strokeWidth={2} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={15} fontWeight={800}>{formatCompact(result.netAnnual)}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>net / yr</text>
        {arcs.map((a, i) => (
          <g key={`l-${i}`} transform={`translate(310, ${36 + i * 32})`}>
            <rect x={0} y={-9} width={12} height={12} rx={3} fill={a.color} />
            <text x={20} y={1} className="fill-zinc-600" fontSize={12} fontWeight={600}>{a.label}</text>
            <text x={300} y={1} textAnchor="end" className="fill-zinc-900" fontSize={12} fontWeight={700}>{formatUSD(a.value)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
