"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeNpv,
  formatUSD,
  formatCompact,
  type NpvResult,
} from "@/lib/calculators/npv";

type FormState = {
  initialInvestment: string;
  discountRatePct: string;
  cashFlows: string[];
};

const DEFAULTS: FormState = {
  initialInvestment: "100000",
  discountRatePct: "10",
  cashFlows: ["30000", "35000", "40000", "45000", "50000"],
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): NpvResult | null {
  return computeNpv({
    initialInvestment: num(f.initialInvestment) || 0,
    discountRatePct: num(f.discountRatePct) || 0,
    cashFlows: f.cashFlows.map((c) => num(c) || 0),
  });
}

export default function NpvCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<NpvResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setFlow(i: number, v: string) {
    setForm((f) => {
      const cashFlows = [...f.cashFlows];
      cashFlows[i] = v;
      return { ...f, cashFlows };
    });
  }

  function addFlow() {
    setForm((f) => ({ ...f, cashFlows: [...f.cashFlows, "0"] }));
  }

  function removeFlow(i: number) {
    setForm((f) => ({
      ...f,
      cashFlows: f.cashFlows.length > 1 ? f.cashFlows.filter((_, idx) => idx !== i) : f.cashFlows,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative initial investment, a discount rate, and at least one cash flow.");
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

  const positive = result ? result.npv >= 0 : false;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Project inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the upfront cost, a discount rate, then each year&apos;s cash flow.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="invest">Initial investment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="invest" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initialInvestment} onChange={(e) => set("initialInvestment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Discount rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.discountRatePct} onChange={(e) => set("discountRatePct", e.target.value)} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="mb-0" htmlFor="cf-0">Yearly cash flows</Label>
                <button type="button" onClick={addFlow} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700">
                  <Plus className="size-3.5" /> Add year
                </button>
              </div>
              <div className="space-y-2">
                {form.cashFlows.map((cf, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-xs font-semibold text-zinc-500">Year {i + 1}</span>
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={`cf-${i}`} type="number" step="any" inputMode="decimal" className="h-10 pl-7" value={cf} onChange={(e) => setFlow(i, e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeFlow(i)} className="shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30" disabled={form.cashFlows.length <= 1} aria-label={`Remove year ${i + 1}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net present value</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.npv) : "—"}
          </p>
          {result && (
            <p className={`mt-1 text-xs font-semibold ${positive ? "text-emerald-600" : "text-rose-500"}`}>
              {positive ? "Positive NPV — the project adds value at this rate." : "Negative NPV — the project destroys value at this rate."}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Initial investment" value={formatUSD(-result.initialInvestment)} />
                <Row label="Discounted inflows" value={formatUSD(result.totalDiscountedInflows)} />
                <Row label="Profitability index" value={result.profitabilityIndex.toFixed(2)} />
                <Row label="IRR" value={result.irrPct === null ? "n/a" : `${result.irrPct.toFixed(1)}%`} />
                <Row
                  label="Discounted payback"
                  value={result.paybackYear === null ? "Never" : `${result.paybackYear.toFixed(1)} yr`}
                />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <CumulativeChart result={result} />}
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

function CumulativeChart({ result }: { result: NpvResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxYear = data[data.length - 1].year || 1;
  const cumVals = data.map((p) => p.cumulative);
  const maxVal = Math.max(...cumVals, 0);
  const minVal = Math.min(...cumVals, 0);
  const range = maxVal - minVal || 1;

  const x = (yr: number) => pad.l + (yr / maxYear) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / range) * innerH;

  const cumPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.cumulative).toFixed(1)}`);
  const cumLine = `M${cumPts.join(" L")}`;
  const zeroY = y(0);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative discounted cash flow</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Cumulative NPV</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-300" /> Break-even</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative discounted cash flow chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={cumLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p) => (
          <circle key={p.year} cx={x(p.year)} cy={y(p.cumulative)} r={2.5} fill="#fb923c" />
        ))}
        {data.map((p) => (
          <text key={p.year} x={x(p.year)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.year}</text>
        ))}
      </svg>
    </div>
  );
}
