"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeLoanToValue,
  formatUSD,
  formatPct,
  type LoanToValueResult,
} from "@/lib/calculators/loan-to-value";

type FormState = {
  propertyValue: string;
  loanAmount: string;
};

const DEFAULTS: FormState = {
  propertyValue: "400000",
  loanAmount: "320000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LoanToValueResult | null {
  return computeLoanToValue({
    propertyValue: num(f.propertyValue),
    loanAmount: num(f.loanAmount) || 0,
  });
}

export default function LoanToValueCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a property value above 0 and a loan amount of 0 or more." : null;

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
          <h2 className="text-base font-extrabold text-zinc-900">Property and loan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the figures, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="value">Appraised property value</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="value" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.propertyValue} onChange={(e) => set("propertyValue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="loan">Loan amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="loan" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Loan-to-value ratio</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.ltvPct) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Your equity</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.equityPct)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Equity amount</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.equityAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Risk band</span>
                  <span className="text-sm font-bold text-zinc-900">{result.band}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && result.pmiLikely && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Above eighty percent LTV many US lenders require private mortgage insurance until you build more equity.
            </p>
          )}
        </div>
      </form>

      {/* LTV vs equity split */}
      {result && <LtvBar result={result} />}

      {/* What-if: how different loan amounts change your LTV and equity. */}
      {result && <LoanAmountScenarios form={form} />}
    </div>
  );
}

/** Sweeps the loan amount so the user sees how their LTV ratio and equity shift
 *  across several borrowing levels, plus their own value. */
function LoanAmountScenarios({ form }: { form: FormState }) {
  const propertyValue = num(form.propertyValue);
  const base = num(form.loanAmount) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const pv = Number.isFinite(propertyValue) && propertyValue > 0 ? propertyValue : 0;
    const presets = [0.6, 0.7, 0.8, 0.9, 0.95].map((f) => Math.round(pv * f));
    const loans = Array.from(new Set([...presets, base]))
      .filter((l) => l >= 0)
      .sort((a, b) => a - b);

    const built = loans.map((loan) => {
      const r = compute({ ...form, loanAmount: String(loan) });
      return {
        loan,
        ltv: r ? formatPct(r.ltvPct) : "—",
        equity: r?.equityAmount ?? 0,
        band: r?.band ?? "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.loan === base) };
  }, [form, base, propertyValue]);

  const columns: GridColumn[] = [
    { key: "loan", label: "Loan amount", format: (v) => formatUSD(Number(v)) },
    { key: "ltv", label: "LTV ratio", align: "right" },
    { key: "equity", label: "Equity amount", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "band", label: "Risk band", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you borrowed a different amount?"
      caption="Same property value — only the loan amount changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="loan-to-value-scenarios"
    />
  );
}

function LtvBar({ result }: { result: LoanToValueResult }) {
  const ltv = Math.max(0, Math.min(100, result.ltvPct));
  const equity = Math.max(0, 100 - ltv);

  const W = 640;
  const H = 96;
  const pad = { l: 16, r: 16, t: 28, b: 24 };
  const innerW = W - pad.l - pad.r;
  const barH = 24;
  const ltvW = (ltv / 100) * innerW;
  const equityW = (equity / 100) * innerW;
  const mark80 = pad.l + 0.8 * innerW;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Loan versus equity share of value</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Loan</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-amber-200" /> Equity</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan to value share bar">
        <rect x={pad.l} y={pad.t} width={Math.max(0, ltvW)} height={barH} rx={4} fill="#f97316" />
        <rect x={pad.l + ltvW} y={pad.t} width={Math.max(0, equityW)} height={barH} rx={4} fill="#fde68a" />
        {ltvW > 36 && (
          <text x={pad.l + ltvW / 2} y={pad.t + barH / 2 + 4} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>{ltv.toFixed(0)}%</text>
        )}
        {equityW > 36 && (
          <text x={pad.l + ltvW + equityW / 2} y={pad.t + barH / 2 + 4} textAnchor="middle" fill="#92400e" fontSize={12} fontWeight={700}>{equity.toFixed(0)}%</text>
        )}
        {/* 80% reference line */}
        <line x1={mark80} y1={pad.t - 6} x2={mark80} y2={pad.t + barH + 6} stroke="#71717a" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={mark80} y={pad.t - 10} textAnchor="middle" className="fill-zinc-500" fontSize={10}>80% PMI line</text>
        <text x={pad.l} y={H - 6} textAnchor="start" className="fill-zinc-400" fontSize={10}>0%</text>
        <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-zinc-400" fontSize={10}>100% of value</text>
      </svg>
    </div>
  );
}
