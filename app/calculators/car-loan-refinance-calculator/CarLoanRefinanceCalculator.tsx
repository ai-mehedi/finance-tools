"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeCarLoanRefinance,
  formatUSD,
  formatUSD2,
  formatCompact,
  type CarLoanRefinanceResult,
} from "@/lib/calculators/car-loan-refinance";

type FormState = {
  currentBalance: string;
  currentRatePct: string;
  monthsRemaining: string;
  newRatePct: string;
  newTermMonths: string;
};

const DEFAULTS: FormState = {
  currentBalance: "22000",
  currentRatePct: "9.5",
  monthsRemaining: "48",
  newRatePct: "6.5",
  newTermMonths: "48",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CarLoanRefinanceResult | null {
  return computeCarLoanRefinance({
    currentBalance: num(f.currentBalance) || 0,
    currentRatePct: num(f.currentRatePct) || 0,
    monthsRemaining: num(f.monthsRemaining),
    newRatePct: num(f.newRatePct) || 0,
    newTermMonths: num(f.newTermMonths),
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function CarLoanRefinanceCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a balance, months remaining and a new term all greater than 0." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const saves = result ? result.totalSavings >= 0 : false;

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Loan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="bal" label="Current loan balance" value={form.currentBalance} onChange={(v) => set("currentBalance", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curRate">Current rate (% / yr)</Label>
                <Input id="curRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentRatePct} onChange={(e) => set("currentRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="monthsLeft">Months remaining</Label>
                <Input id="monthsLeft" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.monthsRemaining} onChange={(e) => set("monthsRemaining", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="newRate">New rate (% / yr)</Label>
                <Input id="newRate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newRatePct} onChange={(e) => set("newRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newTerm">New term (months)</Label>
                <Input id="newTerm" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.newTermMonths} onChange={(e) => set("newTermMonths", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">New monthly payment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.newMonthlyPayment) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Current payment</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.currentMonthlyPayment)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Monthly savings</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlySavings)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Lifetime savings</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalSavings)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {saves ? "Refinancing lowers your total cost by " : "Refinancing raises your total cost by "}
              <span className="font-semibold text-zinc-600">{formatUSD(Math.abs(result.totalSavings))}</span>. New total interest{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.newTotalInterest)}</span>.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different new interest rates change the payment + lifetime savings. */}
      {result && <NewRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the new interest rate so the user sees the new monthly payment and
 *  lifetime savings across a range of rates plus their own entered rate. */
function NewRateScenarios({ form }: { form: FormState }) {
  const base = num(form.newRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([3, 4.5, 6, 7.5, 9, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, newRatePct: String(rate) });
      return {
        rate,
        payment: r?.newMonthlyPayment ?? 0,
        savings: r?.totalSavings ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "New rate (%)", format: (v) => `${Number(v)}%` },
    { key: "payment", label: "New monthly payment", align: "right", format: (v) => formatUSD2(Number(v)) },
    { key: "savings", label: "Lifetime savings", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you locked a different rate?"
      caption="Same balance and new term — only the refinanced interest rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="car-loan-refinance-rate-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: CarLoanRefinanceResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.currentBalance, p.newBalance))) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const curPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.currentBalance).toFixed(1)}`);
  const newPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.newBalance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${newPts.join(" L")} L${x(months)},${y(0)} Z`;
  const curLine = `M${curPts.join(" L")}`;
  const newLine = `M${newPts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Refinanced</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Current</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Car loan balance comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="refiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#refiFill)" />
        <path d={newLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={curLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
