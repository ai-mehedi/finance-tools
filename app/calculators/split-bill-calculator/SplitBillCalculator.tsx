"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeSplitBill,
  formatUSD,
  formatCompact,
  type SplitMode,
  type SplitBillResult,
} from "@/lib/calculators/split-bill";

const TIP_PRESETS = [0, 10, 15, 18, 20, 25];

type FormState = {
  billAmount: string;
  taxPct: string;
  tipPct: string;
  people: string;
  mode: SplitMode;
  roundUp: boolean;
  sharesText: string; // comma separated weights for "shares" mode
};

const DEFAULTS: FormState = {
  billAmount: "120",
  taxPct: "8",
  tipPct: "18",
  people: "4",
  mode: "even",
  roundUp: false,
  sharesText: "1, 1, 2, 1",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function parseShares(text: string, count: number): number[] {
  const parts = text
    .split(/[,\s]+/)
    .map((p) => p.trim())
    .filter((p) => p !== "")
    .map((p) => Number(p));
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(Number.isFinite(parts[i]) ? parts[i] : 1);
  }
  return out;
}

function compute(f: FormState): SplitBillResult | null {
  const people = num(f.people);
  const count = Number.isFinite(people) ? Math.floor(people) : 0;
  return computeSplitBill({
    billAmount: num(f.billAmount) || 0,
    taxPct: num(f.taxPct) || 0,
    tipPct: num(f.tipPct) || 0,
    people: count,
    mode: f.mode,
    shares: parseShares(f.sharesText, count),
    roundUp: f.roundUp,
  });
}

export default function SplitBillCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SplitBillResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a bill of zero or more, at least one person, and valid share weights.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the bill, then press Calculate.</p>

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
                <Input id="people" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.people} onChange={(e) => set("people", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tax">Tax (%)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxPct} onChange={(e) => set("taxPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tip">Tip (%)</Label>
                <Input id="tip" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.tipPct} onChange={(e) => set("tipPct", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="tipPreset">Quick tip</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {TIP_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tipPct", String(t))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      num(form.tipPct) === t
                        ? "border-orange-300 bg-orange-50 text-orange-600"
                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mode">Split method</Label>
                <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as SplitMode)}>
                  <option value="even">Split evenly</option>
                  <option value="shares">By shares</option>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400" checked={form.roundUp} onChange={(e) => set("roundUp", e.target.checked)} />
                  Round each share up
                </label>
              </div>
            </div>

            {form.mode === "shares" && (
              <div>
                <Label htmlFor="shares">Share weights (comma separated)</Label>
                <Input id="shares" type="text" inputMode="numeric" className="h-11" value={form.sharesText} onChange={(e) => set("sharesText", e.target.value)} />
                <p className="mt-1 text-xs text-zinc-400">One weight per person, e.g. 1, 1, 2 means the third person pays double.</p>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {result && form.mode === "even" ? "Each person pays" : "Bill total"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(form.mode === "even" ? result.shares[0]?.amount ?? result.perPersonEven : result.total) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Bill</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.bill)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tax</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.tax)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tip</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.tip)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-orange-500/10 px-3 py-2.5">
                  <span className="text-sm font-bold text-orange-700">Grand total</span>
                  <span className="text-sm font-extrabold tabular-nums text-orange-700">{formatUSD(result.total)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Per-person breakdown chart */}
      {result && result.shares.length > 0 && <ShareChart result={result} />}
    </div>
  );
}

function ShareChart({ result }: { result: SplitBillResult }) {
  const data = result.shares;
  const W = 640;
  const rowH = 34;
  const pad = { l: 70, r: 64, t: 10, b: 10 };
  const H = pad.t + pad.b + data.length * rowH;
  const innerW = W - pad.l - pad.r;
  const maxVal = Math.max(...data.map((d) => d.amount)) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Who pays what</h3>
        <span className="text-xs text-zinc-500">{data.length} people</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Per person payment breakdown">
        {data.map((d, i) => {
          const yy = pad.t + i * rowH + 6;
          const barH = rowH - 14;
          const barW = (d.amount / maxVal) * innerW;
          return (
            <g key={d.index}>
              <text x={pad.l - 8} y={yy + barH / 2 + 3} textAnchor="end" className="fill-zinc-500" fontSize={11}>
                Person {d.index}
              </text>
              <rect x={pad.l} y={yy} width={innerW} height={barH} rx={4} fill="#f4f4f5" />
              <rect x={pad.l} y={yy} width={Math.max(2, barW)} height={barH} rx={4} fill={i % 2 === 0 ? "#f97316" : "#fb923c"} />
              <text x={pad.l + Math.max(2, barW) + 6} y={yy + barH / 2 + 3} className="fill-zinc-700" fontSize={11} fontWeight={700}>
                {formatCompact(d.amount)}
              </text>
            </g>
          );
        })}
      </svg>
      {result.roundingCollected > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          Rounding up collected an extra {formatUSD(result.roundingCollected)} above the bill.
        </p>
      )}
    </div>
  );
}
