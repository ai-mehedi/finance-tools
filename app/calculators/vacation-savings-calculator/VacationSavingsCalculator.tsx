"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeVacationSavings,
  formatUSD,
  formatCompact,
  type VacationSavingsResult,
} from "@/lib/calculators/vacation-savings";

type FormState = {
  goal: string;
  alreadySaved: string;
  months: string;
  annualRatePct: string;
};

const DEFAULTS: FormState = {
  goal: "4000",
  alreadySaved: "500",
  months: "12",
  annualRatePct: "4",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): VacationSavingsResult | null {
  return computeVacationSavings({
    goal: num(f.goal),
    alreadySaved: num(f.alreadySaved) || 0,
    months: num(f.months),
    annualRatePct: num(f.annualRatePct) || 0,
  });
}

export default function VacationSavingsCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<VacationSavingsResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a trip cost and a number of months that are both greater than 0.");
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

  const savedNum = num(form.alreadySaved) || 0;
  const breakdown = result
    ? [
        { label: "Already saved", value: savedNum, color: "bg-zinc-300" },
        { label: "Your deposits", value: result.totalDeposits, color: "bg-orange-300" },
        { label: "Interest earned", value: result.interestEarned, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your trip plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set your budget and timeline, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goal">Trip cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="goal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="saved">Already saved</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="saved" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.alreadySaved} onChange={(e) => set("alreadySaved", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="months">Months until trip</Label>
                <Input id="months" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.months} onChange={(e) => set("months", e.target.value)} />
              </div>
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Save each month</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlyDeposit) : "—"}
          </p>
          {result?.fundedByExisting && (
            <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium text-emerald-600">
              Your existing savings already cover this trip.
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

      {/* Savings chart */}
      {result && result.schedule.length > 1 && <SavingsChart result={result} />}
    </div>
  );
}

function SavingsChart({ result }: { result: VacationSavingsResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const lastMonth = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (m: number) => pad.l + (m / lastMonth) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(lastMonth)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(lastMonth / 2), lastMonth].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance building up to the trip</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Vacation savings balance over time">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="vacFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#vacFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>mo {t}</text>
        ))}
      </svg>
    </div>
  );
}
