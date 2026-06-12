"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeTaxDeduction,
  formatUSD,
  formatCompact,
  STATUS_LABEL,
  type FilingStatus,
  type TaxDeductionResult,
} from "@/lib/calculators/tax-deduction";

const STATUSES: FilingStatus[] = ["single", "married", "head"];

type FormState = {
  agi: string;
  filingStatus: FilingStatus;
  marginalRatePct: string;
  mortgageInterest: string;
  stateLocalTaxes: string;
  charitable: string;
  medical: string;
};

const DEFAULTS: FormState = {
  agi: "95000",
  filingStatus: "single",
  marginalRatePct: "22",
  mortgageInterest: "9000",
  stateLocalTaxes: "12000",
  charitable: "3000",
  medical: "2000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TaxDeductionResult | null {
  return computeTaxDeduction({
    agi: num(f.agi),
    filingStatus: f.filingStatus,
    marginalRatePct: num(f.marginalRatePct) || 0,
    mortgageInterest: num(f.mortgageInterest) || 0,
    stateLocalTaxes: num(f.stateLocalTaxes) || 0,
    charitable: num(f.charitable) || 0,
    medical: num(f.medical) || 0,
  });
}

export default function TaxDeductionCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TaxDeductionResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative AGI, marginal rate and deduction amounts.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your deductions</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your itemizable expenses, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="agi">AGI</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="agi" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.agi} onChange={(e) => set("agi", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Filing</Label>
                <Select id="status" className="h-11" value={form.filingStatus} onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="rate">Marginal %</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.marginalRatePct} onChange={(e) => set("marginalRatePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mortgage">Mortgage interest</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="mortgage" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.mortgageInterest} onChange={(e) => set("mortgageInterest", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="salt">State & local taxes</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="salt" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.stateLocalTaxes} onChange={(e) => set("stateLocalTaxes", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="charitable">Charitable gifts</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="charitable" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.charitable} onChange={(e) => set("charitable", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="medical">Medical expenses</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="medical" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.medical} onChange={(e) => set("medical", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Best deduction</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.deductionUsed) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Take the {result.recommended === "itemized" ? "itemized" : "standard"} deduction
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Standard deduction</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.standardDeduction)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Itemized total</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.itemizedTotal)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tax saved vs the other</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.taxSavingsVsItemizing)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Comparison chart */}
      {result && <DeductionChart result={result} />}
    </div>
  );
}

function DeductionChart({ result }: { result: TaxDeductionResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 90, r: 24, t: 16, b: 16 };
  const innerW = W - pad.l - pad.r;
  const maxVal = Math.max(result.standardDeduction, result.itemizedTotal) || 1;

  const barH = 30;
  const stdY = 50;
  const itemY = 130;

  // Stacked itemized segments
  let acc = 0;
  const segs = result.items.map((it) => {
    const x0 = pad.l + (acc / maxVal) * innerW;
    acc += it.value;
    const w = (it.value / maxVal) * innerW;
    return { x0, w, color: it.color, label: it.label, value: it.value };
  });

  const stdW = (result.standardDeduction / maxVal) * innerW;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Standard vs itemized</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          {result.items.map((it) => (
            <span key={it.label} className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm" style={{ background: it.color }} /> {it.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Standard versus itemized deduction comparison">
        {/* Standard bar */}
        <text x={pad.l - 10} y={stdY + barH / 2 + 4} textAnchor="end" className="fill-zinc-600" fontSize={12} fontWeight={700}>Standard</text>
        <rect x={pad.l} y={stdY} width={innerW} height={barH} rx={5} fill="#f4f4f5" />
        <rect x={pad.l} y={stdY} width={Math.max(2, stdW)} height={barH} rx={5} fill="#d4d4d8" />
        <text x={pad.l + Math.max(2, stdW) + 8} y={stdY + barH / 2 + 4} className="fill-zinc-700" fontSize={11} fontWeight={700}>{formatCompact(result.standardDeduction)}</text>

        {/* Itemized stacked bar */}
        <text x={pad.l - 10} y={itemY + barH / 2 + 4} textAnchor="end" className="fill-zinc-600" fontSize={12} fontWeight={700}>Itemized</text>
        <rect x={pad.l} y={itemY} width={innerW} height={barH} rx={5} fill="#f4f4f5" />
        {segs.map((s, i) => (
          <rect key={i} x={s.x0} y={itemY} width={Math.max(1, s.w)} height={barH} fill={s.color} />
        ))}
        <text x={pad.l + (result.itemizedTotal / maxVal) * innerW + 8} y={itemY + barH / 2 + 4} className="fill-zinc-700" fontSize={11} fontWeight={700}>{formatCompact(result.itemizedTotal)}</text>

        {/* Winner marker line */}
        <line x1={pad.l} y1={H - 24} x2={W - pad.r} y2={H - 24} stroke="#f4f4f5" strokeWidth={1} />
        <text x={pad.l} y={H - 8} className="fill-zinc-400" fontSize={10}>
          Recommended: {result.recommended === "itemized" ? "itemize" : "take the standard deduction"}
        </text>
      </svg>
    </div>
  );
}
