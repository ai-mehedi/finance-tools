"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeSeverancePay,
  formatUSD,
  formatCompact,
  type SeverancePayResult,
} from "@/lib/calculators/severance-pay";

type FormState = {
  annualSalary: string;
  yearsOfService: string;
  weeksPerYear: string;
  capWeeks: string;
  bonus: string;
  unusedPtoDays: string;
};

const DEFAULTS: FormState = {
  annualSalary: "78000",
  yearsOfService: "8",
  weeksPerYear: "2",
  capWeeks: "26",
  bonus: "0",
  unusedPtoDays: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SeverancePayResult | null {
  return computeSeverancePay({
    annualSalary: num(f.annualSalary) || 0,
    yearsOfService: num(f.yearsOfService),
    weeksPerYear: num(f.weeksPerYear) || 0,
    capWeeks: num(f.capWeeks) || 0,
    bonus: num(f.bonus) || 0,
    unusedPtoDays: num(f.unusedPtoDays) || 0,
  });
}

export default function SeverancePayCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SeverancePayResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter years of service greater than 0 and non-negative amounts.");
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
        { label: "Base severance", value: result.basePay, color: "bg-orange-500" },
        { label: "Unused PTO payout", value: result.ptoPayout, color: "bg-orange-300" },
        { label: "Extra bonus", value: result.bonus, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salary">Annual salary</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualSalary} onChange={(e) => set("annualSalary", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="years">Years of service</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsOfService} onChange={(e) => set("yearsOfService", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="weeks">Weeks pay / year</Label>
                <Input id="weeks" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.weeksPerYear} onChange={(e) => set("weeksPerYear", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cap">Cap (weeks, 0 = none)</Label>
                <Input id="cap" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.capWeeks} onChange={(e) => set("capWeeks", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pto">Unused PTO (days)</Label>
                <Input id="pto" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.unusedPtoDays} onChange={(e) => set("unusedPtoDays", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="bonus">Extra bonus</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="bonus" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.bonus} onChange={(e) => set("bonus", e.target.value)} />
                </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated severance</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalSeverance) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              {result.weeksGranted.toFixed(1)} weeks at {formatUSD(result.weeklyPay)} per week
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

      {/* Tenure chart */}
      {result && result.schedule.length > 1 && <TenureChart result={result} />}
    </div>
  );
}

function TenureChart({ result }: { result: SeverancePayResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => p.payout)) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const barW = Math.max(6, innerW / (data.length - 1) - 10);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Base severance by length of service</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Base pay</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Severance pay by tenure chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="sevFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {data.filter((p) => p.year > 0).map((p) => {
          const cx = x(p.year);
          const top = y(p.payout);
          const base = y(0);
          return (
            <rect
              key={p.year}
              x={cx - barW / 2}
              y={top}
              width={barW}
              height={Math.max(0, base - top)}
              rx={3}
              fill="url(#sevFill)"
              stroke="#f97316"
              strokeWidth={1}
            />
          );
        })}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
