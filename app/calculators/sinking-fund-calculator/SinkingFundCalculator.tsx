"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeSinkingFund,
  formatUSD,
  formatCompact,
  type DepositFrequency,
  type SinkingFundResult,
} from "@/lib/calculators/sinking-fund";

const FREQUENCIES: { value: DepositFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

type FormState = {
  goalAmount: string;
  startingBalance: string;
  years: string;
  annualRatePct: string;
  frequency: DepositFrequency;
};

const DEFAULTS: FormState = {
  goalAmount: "20000",
  startingBalance: "2000",
  years: "3",
  annualRatePct: "4",
  frequency: "monthly",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SinkingFundResult | null {
  return computeSinkingFund({
    goalAmount: num(f.goalAmount),
    startingBalance: num(f.startingBalance) || 0,
    years: num(f.years),
    annualRatePct: num(f.annualRatePct) || 0,
    frequency: f.frequency,
  });
}

const FREQ_LABEL: Record<DepositFrequency, string> = {
  weekly: "weekly",
  monthly: "monthly",
  quarterly: "quarterly",
  annually: "annual",
};

export default function SinkingFundCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SinkingFundResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a goal above 0, a horizon above 0, and non-negative values.");
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

  const startNum = num(form.startingBalance) || 0;
  const breakdown = result
    ? [
        { label: "Starting balance", value: startNum, color: "bg-zinc-300" },
        { label: "Total deposits", value: result.totalDeposits, color: "bg-orange-300" },
        { label: "Interest earned", value: result.totalInterest, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set a goal and a deadline, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goal">Goal amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="goal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.goalAmount} onChange={(e) => set("goalAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="start">Already saved</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="start" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.startingBalance} onChange={(e) => set("startingBalance", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="freq">Deposit every</Label>
                <Select id="freq" className="h-11" value={form.frequency} onChange={(e) => set("frequency", e.target.value as DepositFrequency)}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Deposit needed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.depositPerPeriod) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              {FREQ_LABEL[form.frequency]} for {result.periods} deposits
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

      {/* Balance chart */}
      {result && result.schedule.length > 1 && <BalanceChart result={result} />}
    </div>
  );
}

function BalanceChart({ result }: { result: SinkingFundResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const span = data[data.length - 1].yearFraction || 1;
  const maxVal = Math.max(...data.map((p) => p.balance)) || 1;

  const x = (yr: number) => pad.l + (yr / span) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.yearFraction).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const depPts = data.map((p) => `${x(p.yearFraction).toFixed(1)},${y(p.deposited).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(span)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const depLine = `M${depPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round((span / 2) * 10) / 10, Math.round(span * 10) / 10].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance building toward your goal</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Deposited</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sinking fund balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="sfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sfFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={depLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
