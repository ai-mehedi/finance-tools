"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeMortgagePoints,
  formatUSD,
  formatCompact,
  type MortgagePointsResult,
} from "@/lib/calculators/mortgage-points";

type FormState = {
  loanAmount: string;
  baseRatePct: string;
  termYears: string;
  points: string;
  rateReductionPerPoint: string;
};

const DEFAULTS: FormState = {
  loanAmount: "320000",
  baseRatePct: "6.75",
  termYears: "30",
  points: "2",
  rateReductionPerPoint: "0.25",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MortgagePointsResult | null {
  return computeMortgagePoints({
    loanAmount: num(f.loanAmount),
    baseRatePct: num(f.baseRatePct) || 0,
    termYears: num(f.termYears),
    points: num(f.points) || 0,
    rateReductionPerPoint: num(f.rateReductionPerPoint) || 0,
  });
}

export default function MortgagePointsCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MortgagePointsResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a loan amount and term greater than 0, with non-negative rate and points.");
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
        { label: "Upfront points cost", value: result.pointsCost, color: "bg-zinc-300" },
        { label: "Monthly saving", value: result.monthlySavings, color: "bg-orange-300" },
        { label: "Net lifetime saving", value: result.lifetimeSavings, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Loan and points</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Each point costs 1 percent of the loan. Set the buy-down, then Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="loan">Loan amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="loan" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="term">Term (years)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rate">Base rate (%)</Label>
                <Input id="rate" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.baseRatePct} onChange={(e) => set("baseRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="points">Points</Label>
                <Input id="points" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.points} onChange={(e) => set("points", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="reduction">Cut / point (%)</Label>
                <Input id="reduction" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.rateReductionPerPoint} onChange={(e) => set("rateReductionPerPoint", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Break-even point</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? result.breakEvenLabel : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Rate drops to {result.rateWithPoints.toFixed(3)}% — payment {formatUSD(result.paymentWithPoints)}/mo
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

      {/* Cumulative cost chart */}
      {result && result.schedule.length > 1 && <PointsChart result={result} />}
    </div>
  );
}

function PointsChart({ result }: { result: MortgagePointsResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const lastMonth = data[data.length - 1].month || 12;
  const maxVal = Math.max(...data.map((p) => Math.max(p.withoutPointsPaid, p.withPointsPaid))) || 1;

  const x = (m: number) => pad.l + (m / lastMonth) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const noPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.withoutPointsPaid).toFixed(1)}`);
  const withPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.withPointsPaid).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${withPts.join(" L")} L${x(lastMonth)},${y(0)} Z`;
  const noLine = `M${noPts.join(" L")}`;
  const withLine = `M${withPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const totalYears = Math.round(lastMonth / 12);
  const xTicks = [0, Math.round(totalYears / 2), totalYears].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative cash paid</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> With points</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> No points</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative cost of buying points chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="pointsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pointsFill)" />
        <path d={withLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={noLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t * 12)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
