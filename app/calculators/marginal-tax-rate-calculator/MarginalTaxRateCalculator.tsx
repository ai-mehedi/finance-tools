"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeMarginalTaxRate,
  formatUSD,
  formatCompact,
  type FilingStatus,
  type MarginalTaxRateResult,
} from "@/lib/calculators/marginal-tax-rate";

const STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head", label: "Head of household" },
];

type FormState = {
  taxableIncome: string;
  status: FilingStatus;
};

const DEFAULTS: FormState = {
  taxableIncome: "85000",
  status: "single",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MarginalTaxRateResult | null {
  return computeMarginalTaxRate({
    taxableIncome: num(f.taxableIncome),
    status: f.status,
  });
}

export default function MarginalTaxRateCalculator() {
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

  const breakdown = result
    ? [
        { label: "Total tax", value: result.totalTax, color: "bg-orange-500" },
        { label: "After-tax income", value: result.afterTaxIncome, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter taxable income and filing status, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="income">Taxable income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.taxableIncome} onChange={(e) => set("taxableIncome", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Filing status</Label>
              <Select id="status" className="h-11" value={form.status} onChange={(e) => set("status", e.target.value as FilingStatus)}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Marginal tax rate</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${result.marginalRatePct.toFixed(0)}%` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Effective rate</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.effectiveRatePct.toFixed(1)}%</span>
                </div>
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                      {b.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Bracket chart */}
      {result && result.schedule.length > 0 && <BracketChart result={result} />}

      {/* What-if: how marginal/effective rate and tax change with taxable income. */}
      {result && <IncomeScenarios form={form} />}
    </div>
  );
}

/** Sweeps taxable income so the user sees how the marginal rate, effective rate
 *  and total tax change at a spread of income levels plus their own value. */
function IncomeScenarios({ form }: { form: FormState }) {
  const base = num(form.taxableIncome) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const incomes = Array.from(
      new Set([40000, 85000, 150000, 250000, 400000, base]),
    )
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = incomes.map((income) => {
      const r = compute({ ...form, taxableIncome: String(income) });
      return {
        income,
        marginal: r ? `${r.marginalRatePct.toFixed(0)}%` : "—",
        effective: r ? `${r.effectiveRatePct.toFixed(1)}%` : "—",
        tax: r?.totalTax ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.income === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "income", label: "Taxable income", format: (v) => formatUSD(Number(v)) },
    { key: "marginal", label: "Marginal rate", align: "right" },
    { key: "effective", label: "Effective rate", align: "right" },
    { key: "tax", label: "Total tax", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="How does your rate change with income?"
      caption="Same filing status — only taxable income changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="marginal-tax-rate-income-scenarios"
    />
  );
}

function BracketChart({ result }: { result: MarginalTaxRateResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxTax = Math.max(...data.map((d) => d.taxInBand), 1);
  const gap = 10;
  const bw = (innerW - gap * (data.length - 1)) / data.length;

  const y = (v: number) => pad.t + innerH - (v / maxTax) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxTax / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Tax paid in each bracket</h3>
        <span className="text-xs text-zinc-500">Marginal rate {result.marginalRatePct.toFixed(0)}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Tax by bracket bar chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const bx = pad.l + i * (bw + gap);
          const top = y(d.taxInBand);
          const h = pad.t + innerH - top;
          const isTop = d.rate === result.marginalRatePct;
          return (
            <g key={i}>
              <rect x={bx} y={top} width={bw} height={Math.max(0, h)} rx={4} fill={isTop ? "#f97316" : "#fb923c"} opacity={isTop ? 1 : 0.55} />
              <text x={bx + bw / 2} y={H - 10} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{d.rate}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
