"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeLoanPrepayment,
  formatUSD,
  formatCompact,
  formatDuration,
  type LoanPrepaymentResult,
} from "@/lib/calculators/loan-prepayment";

type FormState = {
  principal: string;
  annualRatePct: string;
  termYears: string;
  lumpSum: string;
  extraMonthly: string;
};

const DEFAULTS: FormState = {
  principal: "200000",
  annualRatePct: "6",
  termYears: "30",
  lumpSum: "10000",
  extraMonthly: "200",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LoanPrepaymentResult | null {
  return computeLoanPrepayment({
    principal: num(f.principal),
    annualRatePct: num(f.annualRatePct),
    termYears: num(f.termYears),
    lumpSum: num(f.lumpSum) || 0,
    extraMonthly: num(f.extraMonthly) || 0,
  });
}

export default function LoanPrepaymentCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a positive principal, a term in years, and a lump sum smaller than the balance."
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
        { label: "Interest saved", value: formatUSD(result.interestSaved), color: "bg-emerald-400" },
        { label: "New payoff time", value: formatDuration(result.newMonths), color: "bg-orange-500" },
        { label: "Time cut", value: formatDuration(result.monthsSaved), color: "bg-orange-300" },
        { label: "Scheduled payment", value: formatUSD(result.scheduledPayment), color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your loan and prepayments</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Describe the loan, add prepayments, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="principal">Loan amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="principal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.principal} onChange={(e) => set("principal", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Term (years)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lump">One-time lump sum</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="lump" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.lumpSum} onChange={(e) => set("lumpSum", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="extra">Extra each month</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="extra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.extraMonthly} onChange={(e) => set("extraMonthly", e.target.value)} />
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Interest you save</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.interestSaved) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Comparison chart */}
      {result && result.schedule.length > 1 && <PrepaymentChart result={result} />}

      {/* What-if: how different extra monthly payments change interest saved + payoff time. */}
      {result && <ExtraPaymentScenarios form={form} />}
    </div>
  );
}

/** Sweeps the recurring extra monthly payment so the user sees interest saved
 *  and the new payoff time at a spread of values plus their own. */
function ExtraPaymentScenarios({ form }: { form: FormState }) {
  const base = num(form.extraMonthly) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const extras = Array.from(new Set([0, 100, 200, 500, 1000, base]))
      .filter((e) => e >= 0)
      .sort((a, b) => a - b);

    const built = extras.map((extra) => {
      const r = compute({ ...form, extraMonthly: String(extra) });
      return {
        extra,
        saved: r?.interestSaved ?? 0,
        payoff: r ? formatDuration(r.newMonths) : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.extra === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "extra", label: "Extra / month", format: (v) => formatUSD(Number(v)) },
    { key: "payoff", label: "Paid off in", align: "right" },
    { key: "saved", label: "Interest saved", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you paid extra each month?"
      caption="Same loan and lump sum — only the recurring extra monthly payment changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="loan-prepayment-extra-payment-scenarios"
    />
  );
}

function PrepaymentChart({ result }: { result: LoanPrepaymentResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.baselineBalance)) || 1;

  const x = (mo: number) => pad.l + (mo / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const basePts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.baselineBalance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(months)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const baseLine = `M${basePts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance with and without prepayments</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Prepaying</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Original plan</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan prepayment balance comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="prepayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#prepayFill)" />
        <path d={baseLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
