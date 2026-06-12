"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeTaxRefund,
  formatUSD,
  formatCompact,
  FILING_LABELS,
  type FilingStatus,
  type TaxRefundResult,
} from "@/lib/calculators/tax-refund";

const STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: FILING_LABELS.single },
  { value: "married", label: FILING_LABELS.married },
  { value: "head", label: FILING_LABELS.head },
];

type FormState = {
  grossIncome: string;
  withheld: string;
  filingStatus: FilingStatus;
  dependents: string;
  deductionType: "standard" | "itemized";
  itemizedAmount: string;
};

const DEFAULTS: FormState = {
  grossIncome: "75000",
  withheld: "9500",
  filingStatus: "single",
  dependents: "0",
  deductionType: "standard",
  itemizedAmount: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TaxRefundResult | null {
  return computeTaxRefund({
    grossIncome: num(f.grossIncome),
    withheld: num(f.withheld) || 0,
    filingStatus: f.filingStatus,
    dependents: num(f.dependents) || 0,
    deductionType: f.deductionType,
    itemizedAmount: num(f.itemizedAmount) || 0,
  });
}

export default function TaxRefundCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TaxRefundResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative income, withholding and dependent count.");
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

  const isRefund = result ? result.refund >= 0 : true;

  const breakdown = result
    ? [
        { label: "Deduction used", value: result.deductionUsed, color: "bg-zinc-300" },
        { label: "Taxable income", value: result.taxableIncome, color: "bg-orange-300" },
        { label: "Tax after credits", value: result.taxAfterCredits, color: "bg-orange-500" },
        { label: "Total withheld", value: result.withheld, color: "bg-emerald-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Estimate your federal refund, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Gross annual income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.grossIncome} onChange={(e) => set("grossIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="withheld">Federal tax withheld</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="withheld" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.withheld} onChange={(e) => set("withheld", e.target.value)} />
                </div>
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
                <Label htmlFor="deps">Children (under 17)</Label>
                <Input id="deps" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.dependents} onChange={(e) => set("dependents", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dedtype">Deduction</Label>
                <Select id="dedtype" className="h-11" value={form.deductionType} onChange={(e) => set("deductionType", e.target.value as "standard" | "itemized")}>
                  <option value="standard">Standard</option>
                  <option value="itemized">Itemized</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemized">Itemized amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="itemized" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7 disabled:bg-zinc-50 disabled:text-zinc-400" disabled={form.deductionType === "standard"} value={form.itemizedAmount} onChange={(e) => set("itemizedAmount", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {result ? (isRefund ? "Estimated refund" : "Estimated balance due") : "Estimated refund"}
          </p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${result && !isRefund ? "text-rose-600" : "text-zinc-900"}`}>
            {result ? formatUSD(Math.abs(result.refund)) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs text-zinc-500">
              Marginal rate {(result.marginalRate * 100).toFixed(0)}% · effective rate {(result.effectiveRate * 100).toFixed(1)}%
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

      {/* Bracket chart */}
      {result && result.slices.length > 0 && <BracketChart result={result} />}
    </div>
  );
}

function BracketChart({ result }: { result: TaxRefundResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.slices;
  const maxVal = Math.max(...data.map((s) => s.tax), 1);
  const barW = innerW / data.length;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: pad.t + innerH - (v / maxVal) * innerH };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Tax by bracket</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Tax in band</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Federal tax by bracket chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="trFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {data.map((s, i) => {
          const h = (s.tax / maxVal) * innerH;
          const x = pad.l + i * barW + barW * 0.18;
          const w = barW * 0.64;
          const y = pad.t + innerH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={Math.max(0, h)} rx={3} fill="url(#trFill)" />
              <text x={x + w / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
                {(s.rate * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
