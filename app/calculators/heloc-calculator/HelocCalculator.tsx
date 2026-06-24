"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeHeloc,
  formatUSD,
  formatCompact,
  type HelocResult,
} from "@/lib/calculators/heloc";

type FormState = {
  homeValue: string;
  mortgageBalance: string;
  maxCltvPct: string;
  drawAmount: string;
  annualRatePct: string;
  drawYears: string;
  repayYears: string;
};

const DEFAULTS: FormState = {
  homeValue: "450000",
  mortgageBalance: "260000",
  maxCltvPct: "85",
  drawAmount: "60000",
  annualRatePct: "8.5",
  drawYears: "10",
  repayYears: "20",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HelocResult | null {
  return computeHeloc({
    homeValue: num(f.homeValue),
    mortgageBalance: num(f.mortgageBalance) || 0,
    maxCltvPct: num(f.maxCltvPct),
    drawAmount: num(f.drawAmount) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    drawYears: num(f.drawYears) || 0,
    repayYears: num(f.repayYears),
  });
}

export default function HelocCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a positive home value, a CLTV cap above 0 and a repayment period above 0."
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
        { label: "Available credit line", value: result.availableCredit, color: "bg-zinc-300" },
        { label: "Interest-only payment", value: result.drawMonthlyPayment, color: "bg-orange-300" },
        { label: "Repayment payment", value: result.repayMonthlyPayment, color: "bg-orange-500" },
        { label: "Total interest paid", value: result.totalInterest, color: "bg-orange-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your home and line</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your numbers, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="homeValue">Home value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="homeValue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.homeValue} onChange={(e) => set("homeValue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="mortgageBalance">Mortgage balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="mortgageBalance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.mortgageBalance} onChange={(e) => set("mortgageBalance", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="maxCltvPct">Max CLTV (%)</Label>
                <Input id="maxCltvPct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.maxCltvPct} onChange={(e) => set("maxCltvPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="drawAmount">Amount to borrow</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="drawAmount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.drawAmount} onChange={(e) => set("drawAmount", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="drawYears">Draw (yrs)</Label>
                <Input id="drawYears" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.drawYears} onChange={(e) => set("drawYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="repayYears">Repay (yrs)</Label>
                <Input id="repayYears" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.repayYears} onChange={(e) => set("repayYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Repayment payment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.repayMonthlyPayment) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Combined LTV after draw: {result.cltvAfterDraw.toFixed(1)}%
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

      {/* Balance chart */}
      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different amounts borrowed change the payment and interest. */}
      {result && <DrawAmountScenarios form={form} />}
    </div>
  );
}

/** Sweeps the amount borrowed so the user sees how the repayment payment and
 *  total interest change at a few sensible draw sizes plus their own value. */
function DrawAmountScenarios({ form }: { form: FormState }) {
  const base = num(form.drawAmount) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const draws = Array.from(new Set([10000, 25000, 50000, 75000, 100000, base]))
      .filter((d) => d >= 0)
      .sort((a, b) => a - b);

    const built = draws.map((draw) => {
      const r = compute({ ...form, drawAmount: String(draw) });
      return {
        draw,
        payment: r?.repayMonthlyPayment ?? 0,
        interest: r?.totalInterest ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.draw === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "draw", label: "Amount borrowed", format: (v) => formatUSD(Number(v)) },
    { key: "payment", label: "Repayment / mo", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you borrowed a different amount?"
      caption="Same home, rate and periods — only the amount drawn from the line changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="heloc-draw-amount-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: HelocResult }) {
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

  // Mark the boundary between draw and repayment phases.
  const drawEnd = data.find((p) => p.phase === "repay")?.year ?? years;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Outstanding balance over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-zinc-400" /> Draw ends</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="HELOC balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="helocFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#helocFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {drawEnd > 0 && drawEnd < years && (
          <line x1={x(drawEnd)} y1={pad.t} x2={x(drawEnd)} y2={pad.t + innerH} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
        )}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
