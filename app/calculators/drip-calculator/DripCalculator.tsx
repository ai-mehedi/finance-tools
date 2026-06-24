"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeDrip,
  formatUSD,
  formatCompact,
  type DripResult,
} from "@/lib/calculators/drip";

type FormState = {
  initialInvestment: string;
  sharePrice: string;
  annualDividendPerShare: string;
  dividendGrowthPct: string;
  priceGrowthPct: string;
  years: string;
  reinvest: "yes" | "no";
};

const DEFAULTS: FormState = {
  initialInvestment: "10000",
  sharePrice: "50",
  annualDividendPerShare: "2",
  dividendGrowthPct: "5",
  priceGrowthPct: "6",
  years: "20",
  reinvest: "yes",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DripResult | null {
  return computeDrip({
    initialInvestment: num(f.initialInvestment) || 0,
    sharePrice: num(f.sharePrice) || 0,
    annualDividendPerShare: num(f.annualDividendPerShare) || 0,
    dividendGrowthPct: num(f.dividendGrowthPct) || 0,
    priceGrowthPct: num(f.priceGrowthPct) || 0,
    years: num(f.years),
    reinvest: f.reinvest === "yes",
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

export default function DripCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter an investment, share price and number of years greater than 0." : null;

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
          <h2 className="text-base font-extrabold text-zinc-900">Your investment</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="invest" label="Initial investment" value={form.initialInvestment} onChange={(v) => set("initialInvestment", v)} />
              <Money id="price" label="Share price" value={form.sharePrice} onChange={(v) => set("sharePrice", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="dps" label="Annual dividend / share" value={form.annualDividendPerShare} onChange={(v) => set("annualDividendPerShare", v)} />
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="divg">Dividend growth (%)</Label>
                <Input id="divg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.dividendGrowthPct} onChange={(e) => set("dividendGrowthPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="priceg">Price growth (%)</Label>
                <Input id="priceg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.priceGrowthPct} onChange={(e) => set("priceGrowthPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reinvest">Reinvest</Label>
                <Select id="reinvest" className="h-11" value={form.reinvest} onChange={(e) => set("reinvest", e.target.value as FormState["reinvest"])}>
                  <option value="yes">Yes (DRIP)</option>
                  <option value="no">No (take cash)</option>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Final value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.finalValue) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total dividends</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalDividends)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Shares owned</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.finalShares.toFixed(2)}</span>
                </div>
                {result.cashDividends > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Dividends as cash</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.cashDividends)}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Started with <span className="font-semibold text-zinc-600">{result.startShares.toFixed(2)}</span> shares.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <DripChart result={result} />}

      {/* What-if: how faster dividend growth compounds the final portfolio value. */}
      {result && <DividendGrowthScenarios form={form} />}
    </div>
  );
}

/** Sweeps the annual dividend growth rate so the user sees how a faster-growing
 *  dividend compounds the final value and total dividends collected. */
function DividendGrowthScenarios({ form }: { form: FormState }) {
  const base = num(form.dividendGrowthPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([0, 3, 5, 7, 10, base]))
      .filter((g) => g >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((growth) => {
      const r = compute({ ...form, dividendGrowthPct: String(growth) });
      return {
        growth,
        finalValue: r?.finalValue ?? 0,
        totalDividends: r?.totalDividends ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.growth === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "growth", label: "Dividend growth", format: (v) => `${Number(v)}%` },
    { key: "finalValue", label: "Final value", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "totalDividends", label: "Total dividends", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the dividend grew faster?"
      caption="Same investment — only the annual dividend growth rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="drip-dividend-growth-scenarios"
    />
  );
}

function DripChart({ result }: { result: DripResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.value)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Portfolio value over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Dividend reinvestment growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="dripFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#dripFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
