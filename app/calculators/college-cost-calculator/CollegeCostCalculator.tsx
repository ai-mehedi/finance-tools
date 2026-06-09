"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCollegeCost,
  formatUSD,
  formatCompact,
  type CollegeCostResult,
} from "@/lib/calculators/college-cost";

type FormState = {
  currentAnnualCost: string;
  yearsUntilStart: string;
  yearsOfStudy: string;
  inflationRatePct: string;
};

const DEFAULTS: FormState = {
  currentAnnualCost: "28000",
  yearsUntilStart: "10",
  yearsOfStudy: "4",
  inflationRatePct: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CollegeCostResult | null {
  return computeCollegeCost({
    currentAnnualCost: num(f.currentAnnualCost),
    yearsUntilStart: num(f.yearsUntilStart) || 0,
    yearsOfStudy: num(f.yearsOfStudy),
    inflationRatePct: num(f.inflationRatePct) || 0,
  });
}

export default function CollegeCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CollegeCostResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a yearly cost and number of study years greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">College details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="cost">Cost per year today</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="cost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentAnnualCost} onChange={(e) => set("currentAnnualCost", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="until">Years until start</Label>
                <Input id="until" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsUntilStart} onChange={(e) => set("yearsUntilStart", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="study">Years of study</Label>
                <Input id="study" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yearsOfStudy} onChange={(e) => set("yearsOfStudy", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="infl">Inflation (%)</Label>
                <Input id="infl" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.inflationRatePct} onChange={(e) => set("inflationRatePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total projected cost</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalCost) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">First year cost at start</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.costAtEnrollment)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Same cost in today's dollars</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInToday)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Added by inflation</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.inflationImpact)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 0 && <CostChart result={result} />}
    </div>
  );
}

function CostChart({ result }: { result: CollegeCostResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const maxVal = Math.max(...data.map((p) => p.yearCost)) || 1;

  const gap = 0.32;
  const slot = innerW / n;
  const barW = slot * (1 - gap);

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: pad.t + innerH - (v / maxVal) * innerH };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Cost for each year of study</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="College cost by year chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((p, i) => {
          const h = (p.yearCost / maxVal) * innerH;
          const bx = pad.l + slot * i + (slot - barW) / 2;
          const by = pad.t + innerH - h;
          return (
            <g key={i}>
              <rect x={bx} y={by} width={barW} height={h} rx={3} fill="#f97316" />
              <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>Yr {p.studyYear}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
