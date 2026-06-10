"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeOvertime,
  formatUSD,
  formatUSD2,
  formatCompact,
  type OvertimeResult,
} from "@/lib/calculators/overtime";

const MULTIPLIERS: { value: string; label: string }[] = [
  { value: "1.5", label: "Time-and-a-half (1.5x)" },
  { value: "2", label: "Double time (2x)" },
  { value: "1.25", label: "1.25x" },
  { value: "1.75", label: "1.75x" },
];

type FormState = {
  hourlyRate: string;
  regularHours: string;
  overtimeHours: string;
  overtimeMultiplier: string;
};

const DEFAULTS: FormState = {
  hourlyRate: "22",
  regularHours: "40",
  overtimeHours: "8",
  overtimeMultiplier: "1.5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): OvertimeResult | null {
  return computeOvertime({
    hourlyRate: num(f.hourlyRate),
    regularHours: num(f.regularHours),
    overtimeHours: num(f.overtimeHours),
    overtimeMultiplier: num(f.overtimeMultiplier),
  });
}

export default function OvertimeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<OvertimeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative rate, at least some hours, and a multiplier of 1 or more.");
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
        { label: "Regular pay", value: formatUSD2(result.regularPay), color: "bg-orange-300" },
        { label: "Overtime pay", value: formatUSD2(result.overtimePay), color: "bg-orange-500" },
        { label: "Overtime rate / hr", value: formatUSD2(result.overtimeRate), color: "bg-zinc-300" },
        { label: "Total hours", value: `${result.totalHours} hrs`, color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your hours</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter a single week, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Hourly rate</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="mult">Overtime rate</Label>
                <Select id="mult" className="h-11" value={form.overtimeMultiplier} onChange={(e) => set("overtimeMultiplier", e.target.value)}>
                  {MULTIPLIERS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reg">Regular hours</Label>
                <Input id="reg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.regularHours} onChange={(e) => set("regularHours", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ot">Overtime hours</Label>
                <Input id="ot" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.overtimeHours} onChange={(e) => set("overtimeHours", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Gross weekly pay</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.totalPay) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Hourly pay chart */}
      {result && result.schedule.length > 1 && <HoursChart result={result} />}
    </div>
  );
}

function HoursChart({ result }: { result: OvertimeResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.pay)) || 1;
  const n = data.length;
  const gap = 2;
  const barW = Math.max(1, innerW / n - gap);

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Pay earned each hour</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-300" /> Regular</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Overtime</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pay per hour chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((p, i) => {
          const bx = pad.l + (innerW / n) * i + gap / 2;
          const by = y(p.pay);
          const bh = pad.t + innerH - by;
          return (
            <rect
              key={i}
              x={bx}
              y={by}
              width={barW}
              height={Math.max(0, bh)}
              rx={1.5}
              fill={p.overtime ? "#f97316" : "#fdba74"}
            />
          );
        })}
        <text x={pad.l} y={H - 8} textAnchor="start" className="fill-zinc-400" fontSize={10}>hour 1</text>
        <text x={W - pad.r} y={H - 8} textAnchor="end" className="fill-zinc-400" fontSize={10}>hour {data.length}</text>
      </svg>
    </div>
  );
}
