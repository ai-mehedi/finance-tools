"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeMortgagePayoff,
  formatUSD,
  formatCompact,
  monthsLabel,
  type MortgagePayoffResult,
} from "@/lib/calculators/mortgage-payoff";

type FormState = {
  balance: string;
  annualRatePct: string;
  termYears: string;
  extraMonthly: string;
};

const DEFAULTS: FormState = {
  balance: "300000",
  annualRatePct: "6.5",
  termYears: "30",
  extraMonthly: "200",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MortgagePayoffResult | null {
  return computeMortgagePayoff({
    balance: num(f.balance),
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
    extraMonthly: num(f.extraMonthly) || 0,
  });
}

export default function MortgagePayoffCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const computed = useMemo(() => compute(form), [form]);
  const result = computed && Number.isFinite(computed.acceleratedMonths) ? computed : null;
  const error =
    computed === null
      ? "Enter a balance and term greater than 0, plus a non-negative rate and extra payment."
      : !Number.isFinite(computed.acceleratedMonths)
        ? "The payment does not cover the interest. Lower the rate or check the term."
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
        { label: "Monthly payment (P&I)", value: result.monthlyPayment, color: "bg-zinc-300" },
        { label: "Interest without extra", value: result.baseTotalInterest, color: "bg-orange-300" },
        { label: "Interest saved", value: result.interestSaved, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your loan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the loan details and an extra monthly amount, then Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance">Current balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="extra">Extra per month</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="extra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.extraMonthly} onChange={(e) => set("extraMonthly", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Remaining term (yrs)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Interest you would save</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.interestSaved) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Paid off in {result.payoffDateLabel} — {monthsLabel(result.monthsSaved)} sooner
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
      {result && result.schedule.length > 1 && <PayoffChart result={result} />}

      {/* What-if: how different extra monthly payments change interest saved + payoff time. */}
      {result && <ExtraPaymentScenarios form={form} />}
    </div>
  );
}

/** Sweeps the extra monthly payment so the user sees interest saved and the new
 *  payoff time at $0 / $100 / $250 / $500 / $1000 plus their own value. */
function ExtraPaymentScenarios({ form }: { form: FormState }) {
  const base = num(form.extraMonthly) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const extras = Array.from(new Set([0, 100, 250, 500, 1000, base]))
      .filter((e) => e >= 0)
      .sort((a, b) => a - b);

    const built = extras.map((extra) => {
      const r = compute({ ...form, extraMonthly: String(extra) });
      return {
        extra,
        saved: r?.interestSaved ?? 0,
        interest: r?.acceleratedTotalInterest ?? 0,
        payoff: r && Number.isFinite(r.acceleratedMonths) ? monthsLabel(r.acceleratedMonths) : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.extra === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "extra", label: "Extra / month", format: (v) => formatUSD(Number(v)) },
    { key: "payoff", label: "Paid off in", align: "right" },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "saved", label: "Interest saved", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you paid extra each month?"
      caption="Same loan — only the extra monthly principal changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="mortgage-payoff-extra-payment-scenarios"
    />
  );
}

function PayoffChart({ result }: { result: MortgagePayoffResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.baseBalance)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const basePts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.baseBalance).toFixed(1)}`);
  const accelPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.acceleratedBalance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${accelPts.join(" L")} L${x(years)},${y(0)} Z`;
  const baseLine = `M${basePts.join(" L")}`;
  const accelLine = `M${accelPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> With extra</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> No extra</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Mortgage balance payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="payoffFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#payoffFill)" />
        <path d={accelLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={baseLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
