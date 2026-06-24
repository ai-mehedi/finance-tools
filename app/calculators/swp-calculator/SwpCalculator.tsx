"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSwp,
  formatUSD,
  formatCompact,
  type SwpResult,
} from "@/lib/calculators/swp";

type FormState = {
  initialInvestment: string;
  monthlyWithdrawal: string;
  annualRatePct: string;
  years: string;
};

const DEFAULTS: FormState = {
  initialInvestment: "1000000",
  monthlyWithdrawal: "8000",
  annualRatePct: "9",
  years: "15",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SwpResult | null {
  return computeSwp({
    initialInvestment: num(f.initialInvestment) || 0,
    monthlyWithdrawal: num(f.monthlyWithdrawal) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    years: num(f.years),
  });
}

function monthsToLabel(m: number): string {
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (yrs === 0) return `${mos} mo`;
  if (mos === 0) return `${yrs} yr`;
  return `${yrs} yr ${mos} mo`;
}

export default function SwpCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter an initial investment above 0, a horizon above 0 and non-negative values."
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
        { label: "Total withdrawn", value: result.totalWithdrawn, color: "bg-orange-500" },
        { label: "Growth earned", value: result.totalInterest, color: "bg-orange-300" },
        { label: "Final balance", value: result.finalBalance, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set your corpus, the monthly draw and the return, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="initial">Initial investment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="initial" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initialInvestment} onChange={(e) => set("initialInvestment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="withdraw">Monthly withdrawal</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="withdraw" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyWithdrawal} onChange={(e) => set("monthlyWithdrawal", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Return (% / yr)</Label>
                <Input id="rate" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Balance after {form.years || "0"} years</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.finalBalance) : "—"}
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
          {result?.depletedMonth != null && (
            <p className="mt-3 rounded-lg bg-rose-100/70 px-3 py-2 text-xs font-medium text-rose-600">
              Your corpus runs out after {monthsToLabel(result.depletedMonth)}. Lower the withdrawal to make it last.
            </p>
          )}
        </div>
      </form>

      {/* Drawdown chart */}
      {result && result.schedule.length > 1 && <DrawdownChart result={result} />}

      {/* What-if: how different monthly withdrawals change the final balance and how long the corpus lasts. */}
      {result && <WithdrawalScenarios form={form} />}
    </div>
  );
}

/** Sweeps the monthly withdrawal so the user sees the final balance and whether
 *  the corpus lasts the full horizon at a range of draws plus their own value. */
function WithdrawalScenarios({ form }: { form: FormState }) {
  const base = num(form.monthlyWithdrawal) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const draws = Array.from(
      new Set([2000, 5000, 8000, 12000, 20000, base]),
    )
      .filter((w) => w >= 0)
      .sort((a, b) => a - b);

    const built = draws.map((withdrawal) => {
      const r = compute({ ...form, monthlyWithdrawal: String(withdrawal) });
      return {
        withdrawal,
        finalBalance: r?.finalBalance ?? 0,
        lasts:
          r == null
            ? "—"
            : r.depletedMonth == null
              ? "Lasts full term"
              : monthsToLabel(r.depletedMonth),
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.withdrawal === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "withdrawal", label: "Monthly withdrawal", format: (v) => formatUSD(Number(v)) },
    { key: "finalBalance", label: "Final balance", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "lasts", label: "How long it lasts", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you withdrew a different amount?"
      caption="Same corpus, return and horizon — only the monthly withdrawal changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="swp-withdrawal-scenarios"
    />
  );
}

function DrawdownChart({ result }: { result: SwpResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.balance, p.withdrawn))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const wdPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.withdrawn).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const wdLine = `M${wdPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance versus money taken out</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Withdrawn</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="SWP drawdown chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="swpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#swpFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={wdLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
