"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computePercentage,
  type PercentMode,
  type PercentageResult,
} from "@/lib/calculators/percentage";

const MODES: { value: PercentMode; label: string }[] = [
  { value: "ofValue", label: "What is P% of a number" },
  { value: "isWhatPercent", label: "A is what percent of B" },
  { value: "changeByPercent", label: "Increase / decrease by P%" },
];

type FormState = {
  mode: PercentMode;
  percent: string;
  base: string;
  part: string;
  whole: string;
  start: string;
  changePercent: string;
};

const DEFAULTS: FormState = {
  mode: "ofValue",
  percent: "20",
  base: "150",
  part: "45",
  whole: "180",
  start: "200",
  changePercent: "15",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PercentageResult | null {
  return computePercentage({
    mode: f.mode,
    percent: num(f.percent),
    base: num(f.base),
    part: num(f.part),
    whole: num(f.whole),
    start: num(f.start),
    changePercent: num(f.changePercent),
  });
}

export default function PercentageCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PercentageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter valid numbers. The whole cannot be zero when finding a percent.");
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

  const isPercentHeadline = form.mode === "isWhatPercent";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Pick a question type, fill in the values, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="mode">Calculation type</Label>
              <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as PercentMode)}>
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>

            {form.mode === "ofValue" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="percent">Percent</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                    <Input id="percent" type="number" step="any" inputMode="decimal" className="h-11 pr-7" value={form.percent} onChange={(e) => set("percent", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="base">Of value</Label>
                  <Input id="base" type="number" step="any" inputMode="decimal" className="h-11" value={form.base} onChange={(e) => set("base", e.target.value)} />
                </div>
              </div>
            )}

            {form.mode === "isWhatPercent" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="part">This value (A)</Label>
                  <Input id="part" type="number" step="any" inputMode="decimal" className="h-11" value={form.part} onChange={(e) => set("part", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="whole">Of total (B)</Label>
                  <Input id="whole" type="number" step="any" inputMode="decimal" className="h-11" value={form.whole} onChange={(e) => set("whole", e.target.value)} />
                </div>
              </div>
            )}

            {form.mode === "changeByPercent" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start">Start value</Label>
                  <Input id="start" type="number" step="any" inputMode="decimal" className="h-11" value={form.start} onChange={(e) => set("start", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="change">Change (+/- %)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                    <Input id="change" type="number" step="any" inputMode="decimal" className="h-11 pr-7" value={form.changePercent} onChange={(e) => set("changePercent", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Answer</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${fmt(result.headline)}${isPercentHeadline ? "%" : ""}` : "—"}
          </p>
          {result && <p className="mt-1 text-sm text-zinc-500">{result.caption}</p>}
          <div className="mt-5 space-y-2">
            {result ? (
              result.rows.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{b.label}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.donut.length > 0 && <DonutChart result={result} />}
    </div>
  );
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return (Math.round(n * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function DonutChart({ result }: { result: PercentageResult }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const stroke = 26;
  const circumference = 2 * Math.PI * r;

  const total = result.donut.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  let offset = 0;
  const arcs = result.donut.map((d) => {
    const frac = Math.max(0, d.value) / total;
    const len = frac * circumference;
    const arc = { ...d, frac, dash: `${len.toFixed(2)} ${(circumference - len).toFixed(2)}`, rot: (offset / circumference) * 360 };
    offset += len;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Visual share</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {arcs.map((a) => (
            <span key={a.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} /> {a.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48" role="img" aria-label="Percentage share donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dash}
              strokeDashoffset={0}
              transform={`rotate(${a.rot - 90} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          ))}
          <text x={cx} y={cy + 5} textAnchor="middle" className="fill-zinc-900" fontSize={22} fontWeight={800}>
            {arcs[0] ? `${Math.round(arcs[0].frac * 100)}%` : ""}
          </text>
        </svg>
      </div>
    </div>
  );
}
