"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
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
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a taxable income of 0 or more." : null;

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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
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

      {/* What-if: how total tax and effective rate change at different income levels. */}
      {result && <IncomeScenarios form={form} />}
    </div>
  );
}

/** Sweeps taxable income so the user sees how their total tax, marginal and
 *  effective rate change at nearby income levels (plus their own value). */
function IncomeScenarios({ form }: { form: FormState }) {
  const base = num(form.taxableIncome);

  const { rows, highlightIndex } = useMemo(() => {
    const presets = [25000, 50000, 85000, 150000, 250000, 500000];
    const incomes = Array.from(new Set([...presets, ...(Number.isFinite(base) && base >= 0 ? [base] : [])]))
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = incomes.map((income) => {
      const r = compute({ ...form, taxableIncome: String(income) });
      return {
        income,
        tax: r?.totalTax ?? 0,
        marginal: r ? `${(r.marginalRate * 100).toFixed(0)}%` : "—",
        effective: r ? `${(r.effectiveRate * 100).toFixed(1)}%` : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.income === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "income", label: "Taxable income", format: (v) => formatUSD(Number(v)) },
    { key: "tax", label: "Federal tax", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "marginal", label: "Marginal rate", align: "right" },
    { key: "effective", label: "Effective rate", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="How tax changes with income"
      caption={`Same filing status (${STATUS_LABEL[form.filingStatus]}) — only taxable income changes.`}
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="tax-bracket-income-scenarios"
    />
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
