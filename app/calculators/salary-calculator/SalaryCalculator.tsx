"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSalary,
  formatUSD,
  formatUSD2,
  formatCompact,
  type PayPeriod,
  type SalaryResult,
} from "@/lib/calculators/salary";

const PERIODS: { value: PayPeriod; label: string }[] = [
  { value: "hourly", label: "Per hour" },
  { value: "daily", label: "Per day" },
  { value: "weekly", label: "Per week" },
  { value: "biweekly", label: "Per 2 weeks" },
  { value: "semimonthly", label: "Twice a month" },
  { value: "monthly", label: "Per month" },
  { value: "annual", label: "Per year" },
];

type FormState = {
  amount: string;
  period: PayPeriod;
  hoursPerWeek: string;
  daysPerWeek: string;
};

const DEFAULTS: FormState = {
  amount: "30",
  period: "hourly",
  hoursPerWeek: "40",
  daysPerWeek: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SalaryResult | null {
  return computeSalary({
    amount: num(f.amount),
    period: f.period,
    hoursPerWeek: num(f.hoursPerWeek),
    daysPerWeek: num(f.daysPerWeek),
  });
}

export default function SalaryCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a non-negative pay amount, 1 to 168 hours per week and 1 to 7 days per week."
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

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your pay</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter one rate, then press Calculate to convert it.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Pay amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="period">Pay period</Label>
                <Select id="period" className="h-11" value={form.period} onChange={(e) => set("period", e.target.value as PayPeriod)}>
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hours">Hours / week</Label>
                <Input id="hours" type="number" min={1} max={168} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="days">Days / week</Label>
                <Input id="days" type="number" min={1} max={7} step="any" inputMode="decimal" className="h-11" value={form.daysPerWeek} onChange={(e) => set("daysPerWeek", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Annual salary</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.annual) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Monthly" value={formatUSD(result.monthly)} />
                <Row label="Biweekly" value={formatUSD(result.biweekly)} />
                <Row label="Weekly" value={formatUSD(result.weekly)} />
                <Row label="Daily" value={formatUSD2(result.daily)} />
                <Row label="Hourly" value={formatUSD2(result.hourly)} />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Pay period chart */}
      {result && <PeriodChart result={result} />}

      {/* What-if: how different pay amounts scale the annual + monthly take. */}
      {result && <PayAmountScenarios form={form} />}
    </div>
  );
}

/** Sweeps the entered pay amount so the user sees how their annual and monthly
 *  pay scale at a few rates around their own value. */
function PayAmountScenarios({ form }: { form: FormState }) {
  const base = num(form.amount);

  const { rows, highlightIndex } = useMemo(() => {
    const seed = Number.isFinite(base) && base > 0 ? base : 30;
    const candidates = [
      seed * 0.5,
      seed * 0.75,
      seed,
      seed * 1.25,
      seed * 1.5,
      seed * 2,
    ].map((a) => Math.round(a * 100) / 100);

    const amounts = Array.from(new Set(candidates))
      .filter((a) => a >= 0)
      .sort((a, b) => a - b);

    const built = amounts.map((amount) => {
      const r = compute({ ...form, amount: String(amount) });
      return {
        amount,
        annual: r?.annual ?? 0,
        monthly: r?.monthly ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.amount === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "amount", label: "Pay amount", format: (v) => formatUSD2(Number(v)) },
    { key: "annual", label: "Annual", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "monthly", label: "Monthly", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your pay rate changed?"
      caption="Same schedule — only the entered pay amount changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="salary-pay-amount-scenarios"
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function PeriodChart({ result }: { result: SalaryResult }) {
  // Show the three larger periods so bars stay comparable.
  const bars = [
    { label: "Weekly", value: result.weekly },
    { label: "Biweekly", value: result.biweekly },
    { label: "Semi-mo.", value: result.semimonthly },
    { label: "Monthly", value: result.monthly },
  ];

  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxVal = Math.max(...bars.map((b) => b.value)) || 1;

  const gap = 28;
  const barW = (innerW - gap * (bars.length - 1)) / bars.length;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, idx) => {
    const v = (maxVal / gridSteps) * idx;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Pay by period</h3>
        <span className="text-xs text-zinc-500">Same salary, different paychecks</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pay amount by period chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const bx = pad.l + i * (barW + gap);
          const by = y(b.value);
          const bh = pad.t + innerH - by;
          return (
            <g key={b.label}>
              <rect x={bx} y={by} width={barW} height={bh} rx={5} fill={i % 2 === 0 ? "#f97316" : "#fb923c"} />
              <text x={bx + barW / 2} y={by - 6} textAnchor="middle" className="fill-zinc-700" fontSize={10} fontWeight={700}>{formatCompact(b.value)}</text>
              <text x={bx + barW / 2} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{b.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
