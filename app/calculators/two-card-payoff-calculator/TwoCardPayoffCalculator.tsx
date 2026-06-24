"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeTwoCardPayoff,
  formatUSD,
  formatCompact,
  type Strategy,
  type TwoCardPayoffResult,
} from "@/lib/calculators/two-card-payoff";

const STRATEGIES: { value: Strategy; label: string }[] = [
  { value: "avalanche", label: "Avalanche (highest APR first)" },
  { value: "snowball", label: "Snowball (smallest balance first)" },
];

type FormState = {
  bal1: string;
  apr1: string;
  min1: string;
  bal2: string;
  apr2: string;
  min2: string;
  monthlyBudget: string;
  strategy: Strategy;
};

const DEFAULTS: FormState = {
  bal1: "6000",
  apr1: "22.9",
  min1: "120",
  bal2: "2500",
  apr2: "17.5",
  min2: "50",
  monthlyBudget: "450",
  strategy: "avalanche",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TwoCardPayoffResult | null {
  return computeTwoCardPayoff({
    card1: { balance: num(f.bal1) || 0, aprPct: num(f.apr1) || 0, minPayment: num(f.min1) || 0 },
    card2: { balance: num(f.bal2) || 0, aprPct: num(f.apr2) || 0, minPayment: num(f.min2) || 0 },
    monthlyBudget: num(f.monthlyBudget),
    strategy: f.strategy,
  });
}

function monthsToText(m: number): string {
  if (m <= 0) return "—";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} mo`;
  if (mo === 0) return `${y} yr`;
  return `${y} yr ${mo} mo`;
}

export default function TwoCardPayoffCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Your monthly budget must be a positive number and at least cover both minimum payments." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your two cards</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter both balances and your total budget, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            {([
              ["Card 1", "bal1", "apr1", "min1"],
              ["Card 2", "bal2", "apr2", "min2"],
            ] as const).map(([title, balKey, aprKey, minKey]) => (
              <div key={title} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">{title}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={balKey}>Balance</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={balKey} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[balKey]} onChange={(e) => set(balKey, e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={aprKey}>APR (%)</Label>
                    <Input id={aprKey} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form[aprKey]} onChange={(e) => set(aprKey, e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={minKey}>Min pay</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={minKey} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form[minKey]} onChange={(e) => set(minKey, e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget">Total monthly budget</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="budget" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyBudget} onChange={(e) => set("monthlyBudget", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="strategy">Payoff order</Label>
                <Select id="strategy" className="h-11" value={form.strategy} onChange={(e) => set("strategy", e.target.value as Strategy)}>
                  {STRATEGIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Debt-free in</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? monthsToText(result.months) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Total interest paid" value={formatUSD(result.totalInterest)} />
                <Row label="Total amount paid" value={formatUSD(result.totalPaid)} />
                <Row label="Card 1 cleared" value={monthsToText(result.card1Months)} />
                <Row label="Card 2 cleared" value={monthsToText(result.card2Months)} />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Balance-over-time chart */}
      {result && result.schedule.length > 1 && <PayoffChart result={result} />}

      {/* What-if: how a bigger monthly budget changes payoff time + interest. */}
      {result && <BudgetScenarios form={form} />}
    </div>
  );
}

/** Sweeps the total monthly budget so the user sees how a bit more each month
 *  shortens the payoff time and cuts total interest. */
function BudgetScenarios({ form }: { form: FormState }) {
  const base = num(form.monthlyBudget) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [base, base + 50, base + 100, base + 200, base + 300, base + 500];
    const budgets = Array.from(new Set(candidates))
      .filter((b) => b > 0)
      .sort((a, b) => a - b);

    const built = budgets.map((budget) => {
      const r = compute({ ...form, monthlyBudget: String(budget) });
      return {
        budget,
        months: r ? monthsToText(r.months) : "—",
        interest: r?.totalInterest ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.budget === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "budget", label: "Monthly budget", format: (v) => formatUSD(Number(v)) },
    { key: "months", label: "Debt-free in", align: "right" },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you budgeted more each month?"
      caption="Same balances and APRs — only your total monthly budget changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="two-card-payoff-budget-scenarios"
    />
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

function PayoffChart({ result }: { result: TwoCardPayoffResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => p.totalBalance)) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const totalPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.totalBalance).toFixed(1)}`);
  const c1Pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.card1Balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${totalPts.join(" L")} L${x(months)},${y(0)} Z`;
  const totalLine = `M${totalPts.join(" L")}`;
  const c1Line = `M${c1Pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance paid down over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Combined</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Card 1</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Credit card balance payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="payoffFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#payoffFill)" />
        <path d={totalLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={c1Line} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
