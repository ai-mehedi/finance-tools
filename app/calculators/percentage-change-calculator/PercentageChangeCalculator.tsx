"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computePercentageChange,
  formatNumber,
  formatPercent,
  type PercentageChangeResult,
} from "@/lib/calculators/percentage-change";

type FormState = {
  oldValue: string;
  newValue: string;
};

const DEFAULTS: FormState = {
  oldValue: "120",
  newValue: "150",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PercentageChangeResult | null {
  return computePercentageChange({
    oldValue: num(f.oldValue),
    newValue: num(f.newValue),
  });
}

export default function PercentageChangeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PercentageChangeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter two numbers. The old value cannot be zero, since change from zero is undefined.");
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

  const accent =
    result?.direction === "increase"
      ? "text-emerald-600"
      : result?.direction === "decrease"
      ? "text-rose-600"
      : "text-zinc-600";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the original and the new value, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="old">Old value</Label>
                <Input id="old" type="number" step="any" inputMode="decimal" className="h-11" value={form.oldValue} onChange={(e) => set("oldValue", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new">New value</Label>
                <Input id="new" type="number" step="any" inputMode="decimal" className="h-11" value={form.newValue} onChange={(e) => set("newValue", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Percentage change</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${accent}`}>
            {result ? formatPercent(result.changePercent) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm capitalize text-zinc-500">{result.direction}</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Old value" value={formatNumber(result.oldValue)} />
                <Row label="New value" value={formatNumber(result.newValue)} />
                <Row label="Absolute change" value={formatNumber(result.difference)} />
                <Row label="Relative change" value={formatPercent(result.changePercent)} />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <ChangeChart result={result} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function ChangeChart({ result }: { result: PercentageChangeResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const bars = result.bars;
  const maxVal = Math.max(...bars.map((b) => Math.abs(b.value)), 1);

  const barW = 90;
  const gap = (innerW - barW * bars.length) / (bars.length + 1);
  const y0 = pad.t + innerH;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Old versus new</h3>
        <span className="text-xs text-zinc-500">{formatPercent(result.changePercent)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Old versus new value bar chart">
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const yy = pad.t + innerH - f * innerH;
          const v = maxVal * f;
          return (
            <g key={i}>
              <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="#f4f4f5" strokeWidth={1} />
              <text x={pad.l - 6} y={yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>
                {Math.round(v).toLocaleString("en-US")}
              </text>
            </g>
          );
        })}
        {bars.map((b, idx) => {
          const h = (Math.abs(b.value) / maxVal) * innerH;
          const bx = pad.l + gap + idx * (barW + gap);
          const fill = idx === 0 ? "#fb923c" : "#f97316";
          return (
            <g key={b.label}>
              <rect x={bx} y={y0 - h} width={barW} height={h} rx={6} fill={fill} />
              <text x={bx + barW / 2} y={y0 - h - 6} textAnchor="middle" className="fill-zinc-700" fontSize={11} fontWeight={700}>
                {b.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </text>
              <text x={bx + barW / 2} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={11}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
