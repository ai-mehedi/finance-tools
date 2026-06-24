"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computePresentValue,
  formatUSD,
  type Frequency,
  type PresentValueResult,
} from "@/lib/calculators/present-value";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannually", label: "Semi-annually" },
  { value: "annually", label: "Annually" },
];

type FormState = {
  futureValue: string;
  payment: string;
  annualRatePct: string;
  years: string;
  frequency: Frequency;
};

const DEFAULTS: FormState = {
  futureValue: "100000",
  payment: "0",
  annualRatePct: "6",
  years: "15",
  frequency: "annually",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PresentValueResult | null {
  return computePresentValue({
    futureValue: num(f.futureValue) || 0,
    payment: num(f.payment) || 0,
    annualRatePct: num(f.annualRatePct),
    years: num(f.years),
    frequency: f.frequency,
  });
}

export default function PresentValueCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a number of years greater than 0 and a non-negative discount rate." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const discount = result ? result.totalFutureCash - result.presentValue : 0;
  const breakdown = result
    ? [
        { label: "PV of lump sum", value: result.pvLumpSum, color: "bg-orange-500" },
        { label: "PV of payments", value: result.pvAnnuity, color: "bg-orange-300" },
        { label: "Discount given up", value: discount, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the future cash and a discount rate, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fv">Future lump sum</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="fv" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.futureValue} onChange={(e) => set("futureValue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="pmt">Payment / period</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pmt" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.payment} onChange={(e) => set("payment", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rate">Discount (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="freq">Compounding</Label>
                <Select id="freq" className="h-11" value={form.frequency} onChange={(e) => set("frequency", e.target.value as Frequency)}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Present value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.presentValue) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm text-zinc-500">{formatUSD(result.totalFutureCash)} of future cash today</p>
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

      {result && result.schedule.length > 1 && <DiscountChart result={result} />}

      {/* What-if: how different discount rates change today's value. */}
      {result && <DiscountRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the discount rate so the user sees how today's value shrinks as the
 *  rate rises — at 2/4/6/8/10% plus their own rate. */
function DiscountRateScenarios({ form }: { form: FormState }) {
  const base = num(form.annualRatePct);

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([2, 4, 6, 8, 10, base]))
      .filter((r) => Number.isFinite(r) && r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, annualRatePct: String(rate) });
      return {
        rate,
        presentValue: r?.presentValue ?? 0,
        discount: r ? r.totalFutureCash - r.presentValue : 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Discount rate", format: (v) => `${Number(v)}%` },
    { key: "presentValue", label: "Present value", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "discount", label: "Discount given up", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the discount rate changed?"
      caption="Same future cash — only the discount rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="present-value-discount-rate-scenarios"
    />
  );
}

function DiscountChart({ result }: { result: PresentValueResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  // Plot the discount factor (1 = full value today, falling toward 0 over time).
  const maxVal = 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = [`${x(0).toFixed(1)},${y(1).toFixed(1)}`].concat(
    data.map((p) => `${x(p.year).toFixed(1)},${y(p.discountFactor).toFixed(1)}`)
  );
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), Math.round(years)].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">How a future dollar loses value</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Worth of $1 today</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Discount factor over time chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>${g.v.toFixed(2)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="pvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pvFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
