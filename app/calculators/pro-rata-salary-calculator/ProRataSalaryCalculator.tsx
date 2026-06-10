"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeProRataSalary,
  formatUSD,
  formatCompact,
  BASIS_FULL,
  type Basis,
  type ProRataSalaryResult,
} from "@/lib/calculators/pro-rata-salary";

const BASES: { value: Basis; label: string; unit: string }[] = [
  { value: "hours", label: "Hours per week", unit: "hrs/wk" },
  { value: "days", label: "Days per week", unit: "days/wk" },
  { value: "weeks", label: "Weeks per year", unit: "wks/yr" },
  { value: "months", label: "Months per year", unit: "mths/yr" },
];

type FormState = {
  fullTimeSalary: string;
  basis: Basis;
  workedUnits: string;
  fullTimeUnits: string;
};

const DEFAULTS: FormState = {
  fullTimeSalary: "60000",
  basis: "hours",
  workedUnits: "24",
  fullTimeUnits: "40",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ProRataSalaryResult | null {
  return computeProRataSalary({
    fullTimeSalary: num(f.fullTimeSalary) || 0,
    basis: f.basis,
    workedUnits: num(f.workedUnits),
    fullTimeUnits: num(f.fullTimeUnits),
  });
}

export default function ProRataSalaryCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ProRataSalaryResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative salary and a full-time figure greater than 0.");
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

  function onBasisChange(b: Basis) {
    setForm((f) => ({ ...f, basis: b, fullTimeUnits: String(BASIS_FULL[b]) }));
  }

  const breakdown = result
    ? [
        { label: "Per month", value: result.proRataMonthly, color: "bg-orange-500" },
        { label: "Per week", value: result.proRataWeekly, color: "bg-orange-300" },
        { label: "Per day", value: result.proRataDaily, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the full-time package, then your reduced schedule.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="salary">Full-time annual salary</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.fullTimeSalary} onChange={(e) => set("fullTimeSalary", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="basis">Compare on the basis of</Label>
              <Select id="basis" className="h-11" value={form.basis} onChange={(e) => onBasisChange(e.target.value as Basis)}>
                {BASES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="worked">You work</Label>
                <Input id="worked" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.workedUnits} onChange={(e) => set("workedUnits", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ftunits">Full time is</Label>
                <Input id="ftunits" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.fullTimeUnits} onChange={(e) => set("fullTimeUnits", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Pro rata salary</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.proRataAnnual) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {(result.fraction * 100).toFixed(1)}% of full time
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

      {/* Earnings ramp chart */}
      {result && result.schedule.length > 1 && <RampChart result={result} />}
    </div>
  );
}

function RampChart({ result }: { result: ProRataSalaryResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxMonth = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.cumulative)) || 1;

  const x = (m: number) => pad.l + (m / maxMonth) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.cumulative).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(maxMonth)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, 3, 6, 9, 12];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative pay over the year</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Earned so far</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pro rata cumulative pay chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="prFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#prFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t === 0 ? "Start" : `M${t}`}</text>
        ))}
      </svg>
    </div>
  );
}
