"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeGoldLoan,
  formatUSD,
  formatCompact,
  type GoldLoanResult,
} from "@/lib/calculators/gold-loan";

const KARATS = [
  { value: "24", label: "24K (pure)" },
  { value: "22", label: "22K" },
  { value: "20", label: "20K" },
  { value: "18", label: "18K" },
];

type FormState = {
  weightGrams: string;
  purityKarat: string;
  ratePerGram24k: string;
  ltvPct: string;
  annualRatePct: string;
  tenureMonths: string;
};

const DEFAULTS: FormState = {
  weightGrams: "50",
  purityKarat: "22",
  ratePerGram24k: "7000",
  ltvPct: "75",
  annualRatePct: "12",
  tenureMonths: "24",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GoldLoanResult | null {
  return computeGoldLoan({
    weightGrams: num(f.weightGrams),
    purityKarat: num(f.purityKarat),
    ratePerGram24k: num(f.ratePerGram24k),
    ltvPct: num(f.ltvPct),
    annualRatePct: num(f.annualRatePct) || 0,
    tenureMonths: num(f.tenureMonths),
  });
}

export default function GoldLoanCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a positive weight, rate per gram, a valid LTV up to 100 and a tenure greater than 0."
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
        { label: "Appraised gold value", value: result.goldValue, color: "bg-zinc-300" },
        { label: "Total interest payable", value: result.totalInterest, color: "bg-orange-300" },
        { label: "Total repayment", value: result.totalPayment, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Pledge details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your gold and loan terms, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="weight">Gold weight (grams)</Label>
                <Input id="weight" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.weightGrams} onChange={(e) => set("weightGrams", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="purity">Purity</Label>
                <Select id="purity" className="h-11" value={form.purityKarat} onChange={(e) => set("purityKarat", e.target.value)}>
                  {KARATS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rateg">Rate / gram (24K)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="rateg" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.ratePerGram24k} onChange={(e) => set("ratePerGram24k", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="ltv">LTV cap (%)</Label>
                <Input id="ltv" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.ltvPct} onChange={(e) => set("ltvPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="irate">Interest (% / yr)</Label>
                <Input id="irate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tenure">Tenure (months)</Label>
                <Input id="tenure" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.tenureMonths} onChange={(e) => set("tenureMonths", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Eligible loan amount</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.eligibleLoan) : "—"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {result ? `Monthly EMI: ${formatUSD(result.emi)}` : ""}
          </p>
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

      {/* Outstanding balance chart */}
      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different interest rates change EMI and total interest. */}
      {result && <InterestRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the annual interest rate so the user sees how EMI and total interest
 *  shift across common rates plus their own chosen rate. */
function InterestRateScenarios({ form }: { form: FormState }) {
  const base = num(form.annualRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([7, 9, 11, 12, 15, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, annualRatePct: String(rate) });
      return {
        rate,
        emi: r?.emi ?? 0,
        totalInterest: r?.totalInterest ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Interest rate", format: (v) => `${Number(v)}%` },
    { key: "emi", label: "Monthly EMI", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "totalInterest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the interest rate changes?"
      caption="Same pledge and tenure — only the annual interest rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="gold-loan-interest-rate-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: GoldLoanResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), Math.round(years)].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Outstanding balance over time</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Principal due</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Gold loan outstanding balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#goldFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
