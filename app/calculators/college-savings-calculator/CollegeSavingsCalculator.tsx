"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCollegeSavings,
  formatUSD,
  formatCompact,
  type CollegeSavingsResult,
} from "@/lib/calculators/college-savings";

type FormState = {
  currentSavings: string;
  monthlyContribution: string;
  annualReturnPct: string;
  currentAnnualCost: string;
  costInflationPct: string;
  yearsUntilCollege: string;
  yearsInCollege: string;
};

const DEFAULTS: FormState = {
  currentSavings: "5000",
  monthlyContribution: "300",
  annualReturnPct: "6",
  currentAnnualCost: "28000",
  costInflationPct: "5",
  yearsUntilCollege: "15",
  yearsInCollege: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CollegeSavingsResult | null {
  return computeCollegeSavings({
    currentSavings: num(f.currentSavings) || 0,
    monthlyContribution: num(f.monthlyContribution) || 0,
    annualReturnPct: num(f.annualReturnPct) || 0,
    currentAnnualCost: num(f.currentAnnualCost) || 0,
    costInflationPct: num(f.costInflationPct) || 0,
    yearsUntilCollege: num(f.yearsUntilCollege),
    yearsInCollege: num(f.yearsInCollege),
  });
}

export default function CollegeSavingsCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CollegeSavingsResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter years until college (0 or more), years in college over 0, and non-negative amounts.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setForm(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  const onTrack = result ? result.gap <= 0 : false;

  const breakdown = result
    ? [
        { label: "Projected savings at enrollment", value: result.futureBalance, color: "bg-orange-500" },
        { label: "Projected total cost", value: result.totalCost, color: "bg-zinc-300" },
        {
          label: onTrack ? "Projected surplus" : "Projected shortfall",
          value: Math.abs(result.gap),
          color: onTrack ? "bg-emerald-400" : "bg-rose-400",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="saved">Saved so far</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="saved" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentSavings} onChange={(e) => set("currentSavings", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="monthly">Monthly contribution</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="monthly" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyContribution} onChange={(e) => set("monthlyContribution", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost">Cost per year (today)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentAnnualCost} onChange={(e) => set("currentAnnualCost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="return">Return (% / yr)</Label>
                <Input id="return" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualReturnPct} onChange={(e) => set("annualReturnPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="infl">Cost rise (% / yr)</Label>
                <Input id="infl" type="number" step="any" inputMode="decimal" className="h-11" value={form.costInflationPct} onChange={(e) => set("costInflationPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="until">Years until</Label>
                <Input id="until" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsUntilCollege} onChange={(e) => set("yearsUntilCollege", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="inyears">Years in</Label>
                <Input id="inyears" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsInCollege} onChange={(e) => set("yearsInCollege", e.target.value)} />
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {result && onTrack ? "On track" : "Funding gap"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(Math.abs(result.gap)) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {onTrack
                ? `${(result.fundedPct * 100).toFixed(0)}% funded — you are covered`
                : `${(result.fundedPct * 100).toFixed(0)}% funded · save about ${formatUSD(result.requiredMonthly)}/mo to fully fund`}
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

      {/* Savings vs goal chart */}
      {result && result.schedule.length > 1 && <SavingsChart result={result} />}
    </div>
  );
}

function SavingsChart({ result }: { result: CollegeSavingsResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.balance), result.totalCost) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const contribPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.contributed).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const contribLine = `M${contribPts.join(" L")}`;
  const goalY = y(result.totalCost);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Savings versus the goal</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Deposited</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-rose-400" /> Goal</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="College savings versus goal chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="csFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#csFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={contribLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        <line x1={pad.l} y1={goalY} x2={W - pad.r} y2={goalY} stroke="#fb7185" strokeWidth={1.5} strokeDasharray="6 3" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
