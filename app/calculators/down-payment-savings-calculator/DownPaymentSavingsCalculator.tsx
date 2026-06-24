"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeDownPaymentSavings,
  formatUSD,
  formatCompact,
  type DownPaymentSavingsResult,
} from "@/lib/calculators/down-payment-savings";

type FormState = {
  goal: string;
  currentSavings: string;
  monthlyContribution: string;
  annualRatePct: string;
};

const DEFAULTS: FormState = {
  goal: "70000",
  currentSavings: "10000",
  monthlyContribution: "1000",
  annualRatePct: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DownPaymentSavingsResult | null {
  return computeDownPaymentSavings({
    goal: num(f.goal) || 0,
    currentSavings: num(f.currentSavings) || 0,
    monthlyContribution: num(f.monthlyContribution) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
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

function describeTime(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} month${m === 1 ? "" : "s"}`;
  if (m === 0) return `${y} year${y === 1 ? "" : "s"}`;
  return `${y} yr ${m} mo`;
}

export default function DownPaymentSavingsCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a goal greater than 0 and non-negative amounts." : null;

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
          <h2 className="text-base font-extrabold text-zinc-900">Your savings plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="goal" label="Down payment goal" value={form.goal} onChange={(v) => set("goal", v)} />
              <Money id="current" label="Already saved" value={form.currentSavings} onChange={(v) => set("currentSavings", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="monthly" label="Monthly saving" value={form.monthlyContribution} onChange={(v) => set("monthlyContribution", v)} />
              <div>
                <Label htmlFor="rate">Savings rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Time to reach goal</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? (result.reached ? describeTime(result.monthsToGoal) : "50+ yrs") : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total you save</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalContributed)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Interest earned</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.interestEarned)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Balance at goal</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.finalBalance)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && !result.reached && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              At this pace the goal is not reached within 50 years. Raise your monthly saving to get there faster.
            </p>
          )}
        </div>
      </form>

      {result && result.reached && result.schedule.length > 1 && <SavingsChart result={result} />}

      {/* What-if: how different monthly savings amounts change time-to-goal and interest. */}
      {result && <MonthlySavingScenarios form={form} />}
    </div>
  );
}

/** Sweeps the monthly contribution so the user sees how time-to-goal and interest
 *  earned change at a range of saving amounts plus their own value. */
function MonthlySavingScenarios({ form }: { form: FormState }) {
  const base = num(form.monthlyContribution) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const amounts = Array.from(new Set([250, 500, 1000, 1500, 2000, base]))
      .filter((a) => a >= 0)
      .sort((a, b) => a - b);

    const built = amounts.map((monthly) => {
      const r = compute({ ...form, monthlyContribution: String(monthly) });
      return {
        monthly,
        time: r ? (r.reached ? describeTime(r.monthsToGoal) : "50+ yrs") : "—",
        interest: r?.interestEarned ?? 0,
        contributed: r?.totalContributed ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.monthly === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "monthly", label: "Monthly saving", format: (v) => formatUSD(Number(v)) },
    { key: "time", label: "Time to goal", align: "right" },
    { key: "interest", label: "Interest earned", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "contributed", label: "Total saved", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you saved a different amount each month?"
      caption="Same goal and rate — only the monthly saving changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="down-payment-savings-scenarios"
    />
  );
}

function SavingsChart({ result }: { result: DownPaymentSavingsResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (mo: number) => pad.l + (mo / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(months)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Savings balance over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Down payment savings growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="dpsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#dpsFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
