"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeDailyInterest,
  formatUSD,
  formatCompact,
  type DailyInterestResult,
} from "@/lib/calculators/daily-interest";

type FormState = {
  principal: string;
  annualRatePct: string;
  days: string;
  mode: "compound" | "simple";
};

const DEFAULTS: FormState = {
  principal: "10000",
  annualRatePct: "5",
  days: "365",
  mode: "compound",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DailyInterestResult | null {
  return computeDailyInterest({
    principal: num(f.principal) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    days: num(f.days) || 0,
    compound: f.mode === "compound",
  });
}

export default function DailyInterestCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<DailyInterestResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative balance and rate, and a number of days greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Enter the details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the values, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="principal">Balance / principal</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="principal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.principal} onChange={(e) => set("principal", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="days">Number of days</Label>
                <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.days} onChange={(e) => set("days", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="mode">Accrual method</Label>
              <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as FormState["mode"])}>
                <option value="compound">Compound daily</option>
                <option value="simple">Simple daily</option>
              </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total interest</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalInterest) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Final balance</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.finalBalance)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">First day interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.firstDayInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Average per day</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.averageDailyInterest)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <InterestChart result={result} />}
    </div>
  );
}

function InterestChart({ result }: { result: DailyInterestResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const days = data[data.length - 1].day || 1;
  const maxVal = Math.max(...data.map((p) => p.interest)) || 1;

  const x = (d: number) => pad.l + (d / days) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.day).toFixed(1)},${y(p.interest).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(days)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(days / 2), days].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Interest accrued over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Daily interest accrual chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="diFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#diFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t}d</text>
        ))}
      </svg>
    </div>
  );
}
