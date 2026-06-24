"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computePayRaise,
  formatUSD,
  formatCompact,
  type PayBasis,
  type RaiseMode,
  type PayRaiseResult,
} from "@/lib/calculators/pay-raise";

const BASES: { value: PayBasis; label: string }[] = [
  { value: "hourly", label: "Per hour" },
  { value: "weekly", label: "Per week" },
  { value: "biweekly", label: "Per 2 weeks" },
  { value: "monthly", label: "Per month" },
  { value: "annually", label: "Per year" },
];

type FormState = {
  currentPay: string;
  payBasis: PayBasis;
  raiseMode: RaiseMode;
  raiseValue: string;
  inflationPct: string;
};

const DEFAULTS: FormState = {
  currentPay: "65000",
  payBasis: "annually",
  raiseMode: "percent",
  raiseValue: "5",
  inflationPct: "3",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PayRaiseResult | null {
  return computePayRaise({
    currentPay: num(f.currentPay),
    payBasis: f.payBasis,
    raiseMode: f.raiseMode,
    raiseValue: num(f.raiseValue) || 0,
    inflationPct: num(f.inflationPct) || 0,
  });
}

export default function PayRaiseCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a current pay greater than 0 and valid raise and inflation values."
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
        { label: "New annual pay", value: result.newAnnual, color: "bg-orange-500" },
        { label: "Old annual pay", value: result.oldAnnual, color: "bg-orange-300" },
        { label: "Annual increase", value: result.annualIncrease, color: "bg-zinc-300" },
        { label: "Real new pay (after inflation)", value: result.realNewAnnual, color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your pay details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your current pay and the raise, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pay">Current pay</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pay" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentPay} onChange={(e) => set("currentPay", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="basis">Pay basis</Label>
                <Select id="basis" className="h-11" value={form.payBasis} onChange={(e) => set("payBasis", e.target.value as PayBasis)}>
                  {BASES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mode">Raise type</Label>
                <Select id="mode" className="h-11" value={form.raiseMode} onChange={(e) => set("raiseMode", e.target.value as RaiseMode)}>
                  <option value="percent">Percentage (%)</option>
                  <option value="amount">Flat amount ($)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="raise">{form.raiseMode === "percent" ? "Raise (%)" : "Raise amount ($)"}</Label>
                <Input id="raise" type="number" step="any" inputMode="decimal" className="h-11" value={form.raiseValue} onChange={(e) => set("raiseValue", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="infl">Annual inflation (%)</Label>
              <Input id="infl" type="number" step="any" inputMode="decimal" className="h-11" value={form.inflationPct} onChange={(e) => set("inflationPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">New pay</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.newPay) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-orange-600">
              +{result.raisePct.toFixed(2)}% raise · real gain {result.realRaisePct.toFixed(2)}%
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

      {/* Projection chart */}
      {result && result.schedule.length > 1 && <RaiseChart result={result} />}

      {/* What-if: how different raise sizes change new pay and the real gain. */}
      {result && <RaiseScenarios form={form} />}
    </div>
  );
}

/** Sweeps the raise value so the user can compare new pay and the real
 *  (inflation-adjusted) gain across a range of raise sizes plus their own. */
function RaiseScenarios({ form }: { form: FormState }) {
  const isPercent = form.raiseMode === "percent";
  const base = num(form.raiseValue) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const presets = isPercent ? [0, 2, 3, 5, 7, 10] : [0, 1000, 2500, 5000, 7500, 10000];
    const values = Array.from(new Set([...presets, base]))
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = values.map((value) => {
      const r = compute({ ...form, raiseValue: String(value) });
      return {
        raise: value,
        newAnnual: r?.newAnnual ?? 0,
        annualIncrease: r?.annualIncrease ?? 0,
        realNewAnnual: r?.realNewAnnual ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.raise === base) };
  }, [form, base, isPercent]);

  const columns: GridColumn[] = [
    {
      key: "raise",
      label: isPercent ? "Raise (%)" : "Raise ($)",
      format: (v) => (isPercent ? `${Number(v)}%` : formatUSD(Number(v))),
    },
    { key: "newAnnual", label: "New annual pay", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "annualIncrease", label: "Annual increase", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "realNewAnnual", label: "Real new pay", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the raise were bigger or smaller?"
      caption="Same pay basis and inflation — only the raise changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="pay-raise-scenarios"
    />
  );
}

function RaiseChart({ result }: { result: PayRaiseResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.annualPay)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const barW = (innerW / data.length) * 0.6;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Annual pay if the raise repeats each year</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Annual pay</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected annual pay chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((p) => (
          <rect
            key={p.year}
            x={x(p.year) - barW / 2}
            y={y(p.annualPay)}
            width={barW}
            height={pad.t + innerH - y(p.annualPay)}
            rx={3}
            fill={p.year === 0 ? "#fb923c" : "#f97316"}
            opacity={p.year === 0 ? 0.55 : 1}
          />
        ))}
        {data.map((p) => (
          <text key={p.year} x={x(p.year)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.year === 0 ? "now" : `+${p.year}y`}</text>
        ))}
      </svg>
    </div>
  );
}
