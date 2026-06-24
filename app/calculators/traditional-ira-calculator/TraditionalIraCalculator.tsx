"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeTraditionalIra,
  formatUSD,
  formatCompact,
  type TraditionalIraResult,
} from "@/lib/calculators/traditional-ira";

type FormState = {
  currentBalance: string;
  annualContribution: string;
  currentAge: string;
  retirementAge: string;
  annualReturnPct: string;
  currentTaxRatePct: string;
  retirementTaxRatePct: string;
};

const DEFAULTS: FormState = {
  currentBalance: "20000",
  annualContribution: "7000",
  currentAge: "35",
  retirementAge: "65",
  annualReturnPct: "7",
  currentTaxRatePct: "24",
  retirementTaxRatePct: "15",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TraditionalIraResult | null {
  return computeTraditionalIra({
    currentBalance: num(f.currentBalance) || 0,
    annualContribution: num(f.annualContribution) || 0,
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    annualReturnPct: num(f.annualReturnPct) || 0,
    currentTaxRatePct: num(f.currentTaxRatePct) || 0,
    retirementTaxRatePct: num(f.retirementTaxRatePct) || 0,
  });
}

export default function TraditionalIraCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Retirement age must be greater than current age, and amounts cannot be negative."
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
        { label: "Total contributions", value: result.totalContributions, color: "bg-orange-300" },
        { label: "Investment growth", value: result.totalGrowth, color: "bg-orange-500" },
        { label: "Tax due at withdrawal", value: result.preTaxBalance - result.afterTaxBalance, color: "bg-zinc-400" },
        { label: "After-tax value", value: result.afterTaxBalance, color: "bg-orange-400" },
        { label: "Up-front tax savings", value: result.upfrontTaxSavings, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Describe your IRA and plan, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bal">Current IRA balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="bal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentBalance} onChange={(e) => set("currentBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="contrib">Annual contribution</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualContribution} onChange={(e) => set("annualContribution", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="age">Current age</Label>
                <Input id="age" type="number" min={0} step={1} inputMode="numeric" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retage">Retire at</Label>
                <Input id="retage" type="number" min={0} step={1} inputMode="numeric" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ret">Return (% / yr)</Label>
                <Input id="ret" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualReturnPct} onChange={(e) => set("annualReturnPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curtax">Tax rate now (%)</Label>
                <Input id="curtax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentTaxRatePct} onChange={(e) => set("currentTaxRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rettax">Tax rate in retirement (%)</Label>
                <Input id="rettax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementTaxRatePct} onChange={(e) => set("retirementTaxRatePct", e.target.value)} />
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

        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Balance at retirement</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.preTaxBalance) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              About {formatUSD(result.afterTaxBalance)} after retirement-rate tax
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

      {result && result.schedule.length > 1 && <IraChart result={result} />}

      {/* What-if: how different annual returns change the balance at retirement. */}
      {result && <ReturnScenarios form={form} />}
    </div>
  );
}

/** Sweeps the expected annual return so the user sees the pre- and after-tax
 *  balance at retirement across a range of returns plus their own value. */
function ReturnScenarios({ form }: { form: FormState }) {
  const base = num(form.annualReturnPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([3, 5, 6, 7, 8, 10, base]))
      .filter((r) => Number.isFinite(r))
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, annualReturnPct: String(rate) });
      return {
        rate: `${rate}%`,
        rateNum: rate,
        preTax: r?.preTaxBalance ?? 0,
        afterTax: r?.afterTaxBalance ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rateNum === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Annual return" },
    { key: "preTax", label: "Balance at retirement", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "afterTax", label: "After-tax value", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your return is different?"
      caption="Same plan — only the expected annual return changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="traditional-ira-return-scenarios"
    />
  );
}

function IraChart({ result }: { result: TraditionalIraResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const a0 = data[0].age;
  const aN = data[data.length - 1].age;
  const ageSpan = aN - a0 || 1;
  const maxVal = Math.max(...data.map((p) => p.balance), 1);

  const x = (age: number) => pad.l + ((age - a0) / ageSpan) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const contribPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.contributed).toFixed(1)}`);
  const afterPts = data.map((p) => `${x(p.age).toFixed(1)},${y(p.afterTax).toFixed(1)}`);
  const areaPath = `M${x(a0)},${y(0)} L${balPts.join(" L")} L${x(aN)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const contribLine = `M${contribPts.join(" L")}`;
  const afterLine = `M${afterPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [a0, Math.round((a0 + aN) / 2), aN].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">IRA value by age</h3>
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Pre-tax</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-600" /> After-tax</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Contributed</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Traditional IRA growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="iraFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#iraFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={afterLine} fill="none" stroke="#c2410c" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
        <path d={contribLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t}</text>
        ))}
      </svg>
    </div>
  );
}
