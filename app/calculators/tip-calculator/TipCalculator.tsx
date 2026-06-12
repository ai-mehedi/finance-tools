"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeTip,
  formatUSD,
  formatCompact,
  type TipBase,
  type TipResult,
} from "@/lib/calculators/tip";

const QUICK_TIPS = [10, 15, 18, 20, 25];

type FormState = {
  billAmount: string;
  taxPct: string;
  tipPct: string;
  people: string;
  tipBase: TipBase;
  roundUp: boolean;
};

const DEFAULTS: FormState = {
  billAmount: "84.50",
  taxPct: "8",
  tipPct: "20",
  people: "2",
  tipBase: "total",
  roundUp: false,
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TipResult | null {
  return computeTip({
    billAmount: num(f.billAmount) || 0,
    taxPct: num(f.taxPct) || 0,
    tipPct: num(f.tipPct) || 0,
    people: Math.max(1, Math.floor(num(f.people) || 1)),
    tipBase: f.tipBase,
    roundUp: f.roundUp,
  });
}

export default function TipCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TipResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a bill of 0 or more, a tip of 0 or more, and at least 1 person.");
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
        { label: "Pre-tax subtotal", value: result.preTax, color: "bg-zinc-300" },
        { label: "Tax in bill", value: result.tax, color: "bg-zinc-400" },
        { label: "Tip", value: result.tip, color: "bg-orange-500" },
        { label: "Tip per person", value: result.tipPerPerson, color: "bg-orange-300" },
        { label: "Total bill", value: result.total, color: "bg-orange-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the bill and how you want to tip, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bill">Bill amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="bill" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.billAmount} onChange={(e) => set("billAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="people">People</Label>
                <Input id="people" type="number" min={1} step={1} inputMode="numeric" className="h-11" value={form.people} onChange={(e) => set("people", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="tip">Tip percentage</Label>
              <div className="relative">
                <Input id="tip" type="number" min={0} step="any" inputMode="decimal" className="h-11 pr-8" value={form.tipPct} onChange={(e) => set("tipPct", e.target.value)} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_TIPS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("tipPct", String(p))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      num(form.tipPct) === p
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tax">Tax in bill (%)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxPct} onChange={(e) => set("taxPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="base">Tip on</Label>
                <Select id="base" className="h-11" value={form.tipBase} onChange={(e) => set("tipBase", e.target.value as TipBase)}>
                  <option value="total">Full bill</option>
                  <option value="pretax">Pre-tax subtotal</option>
                </Select>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2.5">
              <input type="checkbox" checked={form.roundUp} onChange={(e) => set("roundUp", e.target.checked)} className="h-4 w-4 accent-orange-500" />
              <span className="text-sm font-medium text-zinc-700">Round the total up to the next whole dollar</span>
            </label>

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

        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Each person pays</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.perPerson) : "—"}
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

      {result && <TipCompareChart result={result} />}
    </div>
  );
}

function TipCompareChart({ result }: { result: TipResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  const n = data.length;
  const slot = innerW / n;
  const barW = slot * 0.55;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Total at different tip rates</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Total bill</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Tip comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const yy = y(d.total);
          const h = pad.t + innerH - yy;
          return (
            <g key={d.tipPct}>
              <rect x={cx - barW / 2} y={yy} width={barW} height={Math.max(0, h)} rx={4} fill="#fb923c" />
              <text x={cx} y={yy - 5} textAnchor="middle" className="fill-zinc-500" fontSize={9}>{formatCompact(d.total)}</text>
              <text x={cx} y={H - 18} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{d.tipPct}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
