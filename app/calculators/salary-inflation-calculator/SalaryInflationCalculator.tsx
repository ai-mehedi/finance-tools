"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSalaryInflation,
  formatUSD,
  formatCompact,
  type SalaryInflationResult,
} from "@/lib/calculators/salary-inflation";

type FormState = {
  currentSalary: string;
  raisePct: string;
  inflationPct: string;
  years: string;
};

const DEFAULTS: FormState = {
  currentSalary: "60000",
  raisePct: "3",
  inflationPct: "3.5",
  years: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SalaryInflationResult | null {
  return computeSalaryInflation({
    currentSalary: num(f.currentSalary),
    raisePct: num(f.raisePct) || 0,
    inflationPct: num(f.inflationPct) || 0,
    years: num(f.years),
  });
}

export default function SalaryInflationCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a salary above 0 and a number of years between 1 and 60." : null;

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
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Compare your raises against inflation, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="salary">Current salary (per year)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSalary} onChange={(e) => set("currentSalary", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="raise">Raise (% / yr)</Label>
                <Input id="raise" type="number" step="any" inputMode="decimal" className="h-11" value={form.raisePct} onChange={(e) => set("raisePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="infl">Inflation (% / yr)</Label>
                <Input id="infl" type="number" step="any" inputMode="decimal" className="h-11" value={form.inflationPct} onChange={(e) => set("inflationPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={1} max={60} step="1" inputMode="numeric" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Salary in today&apos;s dollars</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.realFinal) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="On paper (nominal)" value={formatUSD(result.nominalFinal)} dot="bg-orange-300" />
                <Row label="Real (today's $)" value={formatUSD(result.realFinal)} dot="bg-orange-500" />
                <Row
                  label="Purchasing power"
                  value={`${result.purchasingPowerChange >= 0 ? "+" : ""}${formatUSD(result.purchasingPowerChange)}`}
                  dot={result.keepsUp ? "bg-emerald-500" : "bg-rose-500"}
                />
                <div className={`rounded-lg px-3 py-2.5 text-xs font-semibold ${result.keepsUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {result.keepsUp
                    ? `Your raises beat inflation by about ${result.realAnnualRatePct.toFixed(1)}% a year.`
                    : `Inflation outpaces your raises by about ${Math.abs(result.realAnnualRatePct).toFixed(1)}% a year.`}
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Nominal vs real chart */}
      {result && result.schedule.length > 1 && <InflationChart result={result} />}

      {/* What-if: how different annual raises change real (today's $) salary. */}
      {result && <RaiseScenarios form={form} />}
    </div>
  );
}

/** Sweeps the annual raise so the user sees how their real (inflation-adjusted)
 *  salary changes at a range of raise rates, plus their own value. */
function RaiseScenarios({ form }: { form: FormState }) {
  const base = num(form.raisePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const raises = Array.from(new Set([0, 2, 3, 4, 5, 7, base]))
      .filter((r) => Number.isFinite(r) && r >= 0)
      .sort((a, b) => a - b);

    const built = raises.map((raise) => {
      const r = compute({ ...form, raisePct: String(raise) });
      return {
        raise,
        nominal: r?.nominalFinal ?? 0,
        real: r?.realFinal ?? 0,
        change: r?.purchasingPowerChange ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.raise === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "raise", label: "Raise (% / yr)", format: (v) => `${Number(v).toFixed(1)}%` },
    { key: "nominal", label: "Nominal salary", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "real", label: "Real (today's $)", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "change", label: "Purchasing power", align: "right", format: (v) => `${Number(v) >= 0 ? "+" : ""}${formatUSD(Number(v))}` },
  ];

  return (
    <ScenarioGrid
      title="What if your raises were different?"
      caption="Same inflation and time horizon — only the annual raise changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="salary-inflation-raise-scenarios"
    />
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function InflationChart({ result }: { result: SalaryInflationResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.nominal)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const nomPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.nominal).toFixed(1)}`);
  const realPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.real).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${nomPts.join(" L")} L${x(years)},${y(0)} Z`;
  const nomLine = `M${nomPts.join(" L")}`;
  const realLine = `M${realPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Nominal vs real salary</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Nominal</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Real</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Nominal versus real salary chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="inflFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#inflFill)" />
        <path d={nomLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={realLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
