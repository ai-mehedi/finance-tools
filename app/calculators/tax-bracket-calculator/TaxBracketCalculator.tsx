"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeTaxBracket,
  formatUSD,
  formatCompact,
  STATUS_LABEL,
  type FilingStatus,
  type TaxBracketResult,
} from "@/lib/calculators/tax-bracket";

const STATUSES: FilingStatus[] = ["single", "married", "head"];

type FormState = {
  taxableIncome: string;
  filingStatus: FilingStatus;
};

const DEFAULTS: FormState = {
  taxableIncome: "85000",
  filingStatus: "single",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TaxBracketResult | null {
  return computeTaxBracket({
    taxableIncome: num(f.taxableIncome),
    filingStatus: f.filingStatus,
  });
}

export default function TaxBracketCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TaxBracketResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a taxable income of 0 or more.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your income</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter taxable income, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Taxable income (per year)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.taxableIncome} onChange={(e) => set("taxableIncome", e.target.value)} />
              </div>
              <p className="mt-1 text-xs text-zinc-400">Use income after the standard or itemized deduction.</p>
            </div>

            <div>
              <Label htmlFor="status">Filing status</Label>
              <Select id="status" className="h-11" value={form.filingStatus} onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Federal income tax</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalTax) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Marginal rate (top bracket)</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{(result.marginalRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Effective rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{(result.effectiveRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">After-tax income</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.afterTaxIncome)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter a valid income to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Bracket chart */}
      {result && <BracketChart result={result} />}
    </div>
  );
}

function BracketChart({ result }: { result: TaxBracketResult }) {
  const active = result.rows.filter((r) => r.incomeInBracket > 0);
  if (active.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-400 shadow-sm">
        No income falls into any bracket yet.
      </div>
    );
  }

  const W = 640;
  const rowH = 40;
  const pad = { l: 56, r: 16, t: 8, b: 8 };
  const H = pad.t + pad.b + active.length * rowH;
  const innerW = W - pad.l - pad.r;
  const maxIncome = Math.max(...active.map((r) => r.incomeInBracket)) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">How your income fills each bracket</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Income taxed</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-600" /> Marginal band</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Income by tax bracket chart">
        {active.map((r, i) => {
          const y = pad.t + i * rowH;
          const w = (r.incomeInBracket / maxIncome) * innerW;
          return (
            <g key={i}>
              <text x={pad.l - 8} y={y + rowH / 2 + 4} textAnchor="end" className="fill-zinc-600" fontSize={11} fontWeight={700}>{(r.rate * 100).toFixed(0)}%</text>
              <rect x={pad.l} y={y + 6} width={innerW} height={rowH - 16} rx={4} fill="#f4f4f5" />
              <rect x={pad.l} y={y + 6} width={Math.max(2, w)} height={rowH - 16} rx={4} fill={r.isMarginal ? "#ea580c" : "#fb923c"} />
              <text x={pad.l + Math.max(2, w) + 6} y={y + rowH / 2 + 4} className="fill-zinc-500" fontSize={10}>
                {formatCompact(r.incomeInBracket)} taxed &rarr; {formatCompact(r.taxInBracket)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
