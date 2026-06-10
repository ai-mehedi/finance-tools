"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computePip,
  formatUSD,
  formatCompact,
  LOT_UNITS,
  type LotType,
  type PipResult,
} from "@/lib/calculators/pip";

const LOT_OPTIONS: { value: LotType; label: string }[] = [
  { value: "standard", label: "Standard (100,000)" },
  { value: "mini", label: "Mini (10,000)" },
  { value: "micro", label: "Micro (1,000)" },
  { value: "nano", label: "Nano (100)" },
  { value: "custom", label: "Custom units" },
];

const PAIR_TYPES: { value: string; label: string; pipSize: string }[] = [
  { value: "standard", label: "Standard pair (0.0001)", pipSize: "0.0001" },
  { value: "jpy", label: "JPY pair (0.01)", pipSize: "0.01" },
];

type FormState = {
  lotType: LotType;
  units: string;
  pairType: string;
  quoteToAccountRate: string;
};

const DEFAULTS: FormState = {
  lotType: "standard",
  units: "100000",
  pairType: "standard",
  quoteToAccountRate: "1",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function resolveUnits(f: FormState): number {
  if (f.lotType === "custom") return num(f.units);
  return LOT_UNITS[f.lotType];
}

function pipSizeFor(pairType: string): number {
  return pairType === "jpy" ? 0.01 : 0.0001;
}

function compute(f: FormState): PipResult | null {
  return computePip({
    units: resolveUnits(f),
    pipSize: pipSizeFor(f.pairType),
    quoteToAccountRate: num(f.quoteToAccountRate),
  });
}

export default function PipCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PipResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onLotChange(v: LotType) {
    setForm((f) => ({
      ...f,
      lotType: v,
      units: v === "custom" ? f.units : String(LOT_UNITS[v as Exclude<LotType, "custom">]),
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a position size and conversion rate greater than 0.");
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
        { label: "Per 1 pip", value: result.pipValue, color: "bg-orange-500" },
        { label: "Per 10 pips", value: result.pipValue10, color: "bg-orange-300" },
        { label: "Per 50 pips", value: result.pipValue50, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your trade</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set the position size and pair, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lot">Lot size</Label>
                <Select id="lot" className="h-11" value={form.lotType} onChange={(e) => onLotChange(e.target.value as LotType)}>
                  {LOT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="units">Units</Label>
                <Input id="units" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.units} disabled={form.lotType !== "custom"} onChange={(e) => set("units", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pair">Pair type</Label>
                <Select id="pair" className="h-11" value={form.pairType} onChange={(e) => set("pairType", e.target.value)}>
                  {PAIR_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="rate">Quote to account rate</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.quoteToAccountRate} onChange={(e) => set("quoteToAccountRate", e.target.value)} />
              </div>
            </div>

            <p className="text-xs leading-5 text-zinc-400">
              Use 1 when the quote currency matches your account currency. Otherwise enter how much one unit of the quote currency is worth in your account currency.
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Value of one pip</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.pipValue) : "—"}
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

      {/* Position size chart */}
      {result && result.schedule.length > 1 && <PipChart result={result} />}
    </div>
  );
}

function PipChart({ result }: { result: PipResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.pipValue)) || 1;
  const n = data.length;
  const bandW = innerW / n;
  const barW = bandW * 0.55;

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Pip value by position size</h3>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500"><span className="h-2 w-3 rounded-sm bg-orange-400/70" /> One pip</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pip value by position size chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="pipFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const cx = pad.l + bandW * i + bandW / 2;
          const yy = y(p.pipValue);
          return (
            <g key={p.label}>
              <rect x={cx - barW / 2} y={yy} width={barW} height={pad.t + innerH - yy} rx={4} fill="url(#pipFill)" stroke="#f97316" strokeWidth={1} />
              <text x={cx} y={H - 18} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{p.label}</text>
              <text x={cx} y={yy - 5} textAnchor="middle" className="fill-zinc-600" fontSize={9.5}>{formatCompact(p.pipValue)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
