"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import AmortizationTable from "../../components/calc/AmortizationTable";
import {
  computeMinimumPayment,
  formatUSD,
  formatCompact,
  formatDuration,
  type MinimumPaymentResult,
} from "@/lib/calculators/minimum-payment";

type FormState = {
  balance: string;
  annualAprPct: string;
  minPercent: string;
  minFloor: string;
};

const DEFAULTS: FormState = {
  balance: "5000",
  annualAprPct: "22",
  minPercent: "2",
  minFloor: "25",
};

const MAX_YEARS = 60;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MinimumPaymentResult | null {
  return computeMinimumPayment({
    balance: num(f.balance),
    annualAprPct: num(f.annualAprPct) || 0,
    minPercent: num(f.minPercent),
    minFloor: num(f.minFloor) || 0,
    maxYears: MAX_YEARS,
  });
}

export default function MinimumPaymentCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a balance above 0 and a minimum percent above 0." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const balanceNum = num(form.balance) || 0;
  const breakdown = result
    ? [
        { label: "Principal (your balance)", value: balanceNum, color: "bg-zinc-300" },
        { label: "Interest paid", value: result.totalInterest, color: "bg-orange-500" },
        { label: "Total you repay", value: result.totalPaid, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Card details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your card terms, then press Calculate.</p>

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
                <Label htmlFor="apr">APR (% / yr)</Label>
                <Input id="apr" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualAprPct} onChange={(e) => set("annualAprPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pct">Minimum (% of balance)</Label>
                <Input id="pct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.minPercent} onChange={(e) => set("minPercent", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="floor">Minimum floor</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="floor" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.minFloor} onChange={(e) => set("minFloor", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Time to pay off</p>
          {result && result.payoffPossible ? (
            <>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
                {formatDuration(result.monthsToPayoff)}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-500">
                First minimum payment {formatUSD(result.firstPayment)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
              Never paid off
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result && result.payoffPossible ? (
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
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">
                At this rate the minimum barely covers interest, so the balance never clears. Pay more than the minimum.
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Payoff chart */}
      {result && result.payoffPossible && result.schedule.length > 1 && <PayoffChart result={result} />}

      {/* What-if: how a higher minimum percent changes payoff time + interest. */}
      {result && <MinPercentScenarios form={form} />}

      {/* Month-by-month payoff schedule (principal split = payment − interest). */}
      {result && result.payoffPossible && result.schedule.length > 1 && (
        <AmortizationTable
          rows={result.schedule
            .filter((p) => p.month > 0)
            .map((p) => ({
              month: p.month,
              payment: p.payment,
              principal: p.payment - p.interest,
              interest: p.interest,
              balance: p.balance,
            }))}
          format={formatUSD}
          csvName="minimum-payment-calculator"
        />
      )}
    </div>
  );
}

/** Sweeps the minimum percent so the user sees how a slightly higher required
 *  minimum slashes payoff time and total interest. */
function MinPercentScenarios({ form }: { form: FormState }) {
  const base = num(form.minPercent) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const pcts = Array.from(new Set([1, 2, 3, 4, 5, base]))
      .filter((p) => p > 0)
      .sort((a, b) => a - b);

    const built = pcts.map((pct) => {
      const r = compute({ ...form, minPercent: String(pct) });
      return {
        pct,
        payoff: r && r.payoffPossible ? formatDuration(r.monthsToPayoff) : "Never",
        interest: r && r.payoffPossible ? r.totalInterest : NaN,
        totalPaid: r && r.payoffPossible ? r.totalPaid : NaN,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.pct === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "pct", label: "Minimum %", format: (v) => `${v}%` },
    { key: "payoff", label: "Paid off in", align: "right" },
    { key: "interest", label: "Total interest", align: "right", format: (v) => (Number.isFinite(Number(v)) ? formatUSD(Number(v)) : "—") },
    { key: "totalPaid", label: "Total repaid", align: "right", format: (v) => (Number.isFinite(Number(v)) ? formatUSD(Number(v)) : "—") },
  ];

  return (
    <ScenarioGrid
      title="What if the minimum were a higher percent?"
      caption="Same balance and APR — only the required minimum percent changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="minimum-payment-percent-scenarios"
    />
  );
}

function PayoffChart({ result }: { result: MinimumPaymentResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(months)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance falling over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance owed</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Minimum payment payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="mpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#mpFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
