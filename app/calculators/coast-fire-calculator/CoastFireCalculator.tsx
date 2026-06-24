"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeCoastFire,
  formatUSD,
  formatCompact,
  type CoastFireResult,
} from "@/lib/calculators/coast-fire";

type FormState = {
  currentAge: string;
  retirementAge: string;
  currentSavings: string;
  annualSpending: string;
  returnRatePct: string;
  inflationRatePct: string;
  withdrawalRatePct: string;
};

const DEFAULTS: FormState = {
  currentAge: "30",
  retirementAge: "65",
  currentSavings: "100000",
  annualSpending: "50000",
  returnRatePct: "7",
  inflationRatePct: "3",
  withdrawalRatePct: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CoastFireResult | null {
  return computeCoastFire({
    currentAge: num(f.currentAge),
    retirementAge: num(f.retirementAge),
    currentSavings: num(f.currentSavings) || 0,
    annualSpending: num(f.annualSpending),
    returnRatePct: num(f.returnRatePct) || 0,
    inflationRatePct: num(f.inflationRatePct) || 0,
    withdrawalRatePct: num(f.withdrawalRatePct),
  });
}

export default function CoastFireCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Retirement age must be above your current age, with positive spending and withdrawal rate." : null;

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
          <h2 className="text-base font-extrabold text-zinc-900">Your plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="curAge">Current age</Label>
                <Input id="curAge" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.currentAge} onChange={(e) => set("currentAge", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="retAge">Retirement age</Label>
                <Input id="retAge" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.retirementAge} onChange={(e) => set("retirementAge", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="savings">Current savings</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="savings" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="spend">Annual spending</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="spend" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualSpending} onChange={(e) => set("annualSpending", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="ret">Return (% / yr)</Label>
                <Input id="ret" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.returnRatePct} onChange={(e) => set("returnRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="infl">Inflation (%)</Label>
                <Input id="infl" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.inflationRatePct} onChange={(e) => set("inflationRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="swr">Withdrawal (%)</Label>
                <Input id="swr" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.withdrawalRatePct} onChange={(e) => set("withdrawalRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Coast FIRE number</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.coastNumber) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">FIRE number at retirement</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.fireNumber)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Projected savings then</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.projectedAtRetirement)}</span>
                </div>
                <div className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${result.hasReachedCoast ? "bg-emerald-50 text-emerald-700" : "bg-white/70 text-zinc-500"}`}>
                  {result.hasReachedCoast
                    ? "You have reached Coast FIRE. Your savings can grow to your target on their own."
                    : `You need ${formatUSD(result.coastNumber)} invested today to coast.`}
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.yearsToRetirement} years to grow at a real return of{" "}
              <span className="font-semibold text-zinc-600">{result.realRatePct.toFixed(1)}%</span>.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <GrowthChart result={result} />}

      {/* What-if: how different expected returns change the Coast FIRE number. */}
      {result && <ReturnRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the expected annual return so the user sees how the Coast FIRE
 *  number and projected savings at retirement shift at 4% / 5% / 6% / 7% / 8% / 10%
 *  plus their own value. A higher return means a smaller amount needed today. */
function ReturnRateScenarios({ form }: { form: FormState }) {
  const base = num(form.returnRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([4, 5, 6, 7, 8, 10, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, returnRatePct: String(rate) });
      return {
        rate,
        coast: r?.coastNumber ?? 0,
        projected: r?.projectedAtRetirement ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Return / yr", format: (v) => `${Number(v).toFixed(1)}%` },
    { key: "coast", label: "Coast FIRE number", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "projected", label: "Projected at retirement", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your returns were different?"
      caption="Same plan — only the expected annual return changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="coast-fire-return-scenarios"
    />
  );
}

function GrowthChart({ result }: { result: CoastFireResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(result.fireNumber, ...data.map((p) => p.balance)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);
  const targetY = y(result.fireNumber);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Savings growth with no new contributions</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-emerald-500" /> FIRE target</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Coast FIRE savings growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="cfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#cfFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={pad.l} y1={targetY} x2={W - pad.r} y2={targetY} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
