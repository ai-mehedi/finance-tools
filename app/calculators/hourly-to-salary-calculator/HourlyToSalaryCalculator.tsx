"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeHourlyToSalary,
  formatUSD,
  formatCompact,
  type HourlyToSalaryResult,
} from "@/lib/calculators/hourly-to-salary";

type FormState = {
  hourlyRate: string;
  hoursPerWeek: string;
  weeksPerYear: string;
};

const DEFAULTS: FormState = {
  hourlyRate: "25",
  hoursPerWeek: "40",
  weeksPerYear: "52",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HourlyToSalaryResult | null {
  return computeHourlyToSalary({
    hourlyRate: num(f.hourlyRate),
    hoursPerWeek: num(f.hoursPerWeek),
    weeksPerYear: num(f.weeksPerYear),
  });
}

export default function HourlyToSalaryCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HourlyToSalaryResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative hourly rate, hours per week above 0, and 1 to 52 weeks per year.");
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

  const breakdown = result
    ? [
        { label: "Monthly", value: result.monthly, color: "bg-orange-500" },
        { label: "Biweekly", value: result.biweekly, color: "bg-orange-400" },
        { label: "Weekly", value: result.weekly, color: "bg-orange-300" },
        { label: "Daily", value: result.daily, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your work schedule</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your wage and hours, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly rate</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="hourlyRate" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hoursPerWeek">Hours per week</Label>
                <Input id="hoursPerWeek" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="weeksPerYear">Paid weeks / year</Label>
                <Input id="weeksPerYear" type="number" min={0} max={52} step="any" inputMode="decimal" className="h-11" value={form.weeksPerYear} onChange={(e) => set("weeksPerYear", e.target.value)} />
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

            {result && (
              <p className="pt-1 text-xs text-zinc-400">
                Based on {formatCompact(result.totalHoursPerYear).replace("$", "")} working hours a year.
              </p>
            )}
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

      {/* Pay period bar chart */}
      {result && <PayChart result={result} />}
    </div>
  );
}

function PayChart({ result }: { result: HourlyToSalaryResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.amount)) || 1;

  const gap = 0.32;
  const band = innerW / data.length;
  const barW = band * (1 - gap);

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Gross pay by period</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="h-2 w-3 rounded-sm bg-orange-400" /> Gross pay
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Gross pay by period chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="hsBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const bx = pad.l + band * i + (band - barW) / 2;
          const by = y(p.amount);
          const bh = pad.t + innerH - by;
          return (
            <g key={p.label}>
              <rect x={bx} y={by} width={barW} height={bh} rx={4} fill="url(#hsBar)" />
              <text x={bx + barW / 2} y={by - 5} textAnchor="middle" className="fill-zinc-500" fontSize={10} fontWeight={700}>
                {formatCompact(p.amount)}
              </text>
              <text x={bx + barW / 2} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
