"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeIrr,
  formatUSD,
  formatCompact,
  type IrrResult,
} from "@/lib/calculators/irr";

type FormState = {
  initialInvestment: string;
  cashFlows: string[];
};

const DEFAULTS: FormState = {
  initialInvestment: "10000",
  cashFlows: ["3000", "4000", "5000", "4000"],
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): IrrResult | null {
  return computeIrr({
    initialInvestment: num(f.initialInvestment) || 0,
    cashFlows: f.cashFlows.map((c) => num(c) || 0),
  });
}

export default function IrrCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<IrrResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setFlow(i: number, v: string) {
    setForm((f) => {
      const next = [...f.cashFlows];
      next[i] = v;
      return { ...f, cashFlows: next };
    });
  }

  function addFlow() {
    setForm((f) => ({ ...f, cashFlows: [...f.cashFlows, ""] }));
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
      setError("Enter an initial investment above 0 and at least one cash flow.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Cash flows</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the upfront cost, then the cash you expect each period.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="initial">Initial investment (year 0)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="initial" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.initialInvestment} onChange={(e) => set("initialInvestment", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cash flow per period</Label>
              {form.cashFlows.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs font-semibold text-zinc-500">Year {i + 1}</span>
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input type="number" step="any" inputMode="decimal" className="h-11 pl-7" value={c} onChange={(e) => setFlow(i, e.target.value)} />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeFlow(i)} aria-label={`Remove year ${i + 1}`}>
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addFlow}>
                + Add year
              </Button>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Internal rate of return</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result && result.irrPct !== null ? `${result.irrPct.toFixed(2)}%` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total invested</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInvested)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total returned</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalReturned)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Net profit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netProfit)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && result.irrPct === null && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              No internal rate of return exists for these cash flows. IRR needs at least one negative and one positive flow.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <CashFlowChart result={result} />}

      {/* What-if: how a different upfront cost changes the IRR and net profit. */}
      {result && <InitialInvestmentScenarios form={form} />}
    </div>
  );
}

/** Sweeps the initial investment so the user sees how the upfront cost moves the
 *  IRR and net profit, keeping the same projected cash flows. */
function InitialInvestmentScenarios({ form }: { form: FormState }) {
  const base = num(form.initialInvestment) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [base * 0.5, base * 0.75, base, base * 1.25, base * 1.5, base * 2]
      .map((v) => Math.round(v))
      .filter((v) => v > 0);
    const amounts = Array.from(new Set(candidates)).sort((a, b) => a - b);

    const built = amounts.map((amount) => {
      const r = compute({ ...form, initialInvestment: String(amount) });
      return {
        investment: amount,
        irr: r && r.irrPct !== null ? `${r.irrPct.toFixed(2)}%` : "—",
        netProfit: r?.netProfit ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.investment === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "investment", label: "Initial investment", format: (v) => formatUSD(Number(v)) },
    { key: "irr", label: "IRR", align: "right" },
    { key: "netProfit", label: "Net profit", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the upfront cost changed?"
      caption="Same projected cash flows — only the initial investment changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="irr-initial-investment-scenarios"
    />
  );
}

function CashFlowChart({ result }: { result: IrrResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const lastPeriod = data[data.length - 1].period || 1;
  const values = data.map((p) => p.cumulative);
  const maxVal = Math.max(0, ...values);
  const minVal = Math.min(0, ...values);
  const span = maxVal - minVal || 1;

  const x = (p: number) => pad.l + (p / lastPeriod) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / span) * innerH;

  const pts = data.map((p) => `${x(p.period).toFixed(1)},${y(p.cumulative).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (span / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const zeroY = y(0);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Cumulative cash flow</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative cash flow chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1} strokeDasharray="4 3" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p) => (
          <circle key={p.period} cx={x(p.period)} cy={y(p.cumulative)} r={3} fill="#f97316" />
        ))}
        {data.map((p) => (
          <text key={p.period} x={x(p.period)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.period}</text>
        ))}
      </svg>
    </div>
  );
}
