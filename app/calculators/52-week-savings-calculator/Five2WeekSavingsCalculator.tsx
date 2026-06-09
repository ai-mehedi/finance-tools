"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeWeek52Savings,
  formatUSD,
  formatUSD2,
  formatCompact,
  type Week52SavingsResult,
} from "@/lib/calculators/52-week-savings";

type FormState = {
  startAmount: string;
  weeklyIncrease: string;
  weeks: string;
};

const DEFAULTS: FormState = {
  startAmount: "1",
  weeklyIncrease: "1",
  weeks: "52",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): Week52SavingsResult | null {
  return computeWeek52Savings({
    startAmount: num(f.startAmount) || 0,
    weeklyIncrease: num(f.weeklyIncrease) || 0,
    weeks: num(f.weeks),
  });
}

export default function Five2WeekSavingsCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<Week52SavingsResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a number of weeks greater than 0 and non-negative amounts.");
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Challenge setup</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start">Week 1 amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="start" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.startAmount} onChange={(e) => set("startAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="step">Weekly increase</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="step" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.weeklyIncrease} onChange={(e) => set("weeklyIncrease", e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="weeks">Number of weeks</Label>
              <Input id="weeks" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.weeks} onChange={(e) => set("weeks", e.target.value)} />
            </div>

            <p className="text-xs leading-relaxed text-zinc-400">
              The classic challenge saves $1 in week 1, $2 in week 2, and so on for 52 weeks. Adjust
              the starting amount and step to fit your own plan.
            </p>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total saved</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.total) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Final week deposit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.finalWeekDeposit)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Average per week</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.averageWeekly)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Saving over {result.weeks} weeks builds a fund of{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.total)}</span> by the end.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <SavingsChart result={result} />}
    </div>
  );
}

function SavingsChart({ result }: { result: Week52SavingsResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const weeks = data[data.length - 1].week || 1;
  const maxVal = data[data.length - 1].total || 1;

  const x = (wk: number) => pad.l + (wk / weeks) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.week).toFixed(1)},${y(p.total).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(weeks)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(weeks / 2), weeks].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Total saved over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="52 week savings growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="wk52Fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#wk52Fill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>wk {t}</text>
        ))}
      </svg>
    </div>
  );
}
