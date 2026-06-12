"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeSubscriptionCost,
  formatUSD,
  formatUSD2,
  formatCompact,
  type BillingCycle,
  type SubscriptionResult,
} from "@/lib/calculators/subscription-cost";

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

type FormState = {
  price: string;
  cycle: BillingCycle;
  quantity: string;
  years: string;
  annualIncreasePct: string;
  investReturnPct: string;
};

const DEFAULTS: FormState = {
  price: "15.99",
  cycle: "monthly",
  quantity: "1",
  years: "10",
  annualIncreasePct: "5",
  investReturnPct: "7",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SubscriptionResult | null {
  return computeSubscriptionCost({
    price: num(f.price),
    cycle: f.cycle,
    quantity: num(f.quantity),
    years: num(f.years),
    annualIncreasePct: num(f.annualIncreasePct) || 0,
    investReturnPct: num(f.investReturnPct) || 0,
  });
}

export default function SubscriptionCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SubscriptionResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative price, a quantity of at least 1 and a number of years greater than 0.");
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
        { label: "Per month", value: formatUSD2(result.monthlyCost), color: "bg-orange-300" },
        { label: "Per year", value: formatUSD(result.yearlyCost), color: "bg-orange-500" },
        { label: "Per day", value: formatUSD2(result.dailyCost), color: "bg-zinc-300" },
        { label: "If invested instead", value: formatUSD(result.investedValue), color: "bg-zinc-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your subscription</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cycle">Billed</Label>
                <Select id="cycle" className="h-11" value={form.cycle} onChange={(e) => set("cycle", e.target.value as BillingCycle)}>
                  {CYCLES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="qty">Seats / qty</Label>
                <Input id="qty" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="inc">Price rise (%/yr)</Label>
                <Input id="inc" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualIncreasePct} onChange={(e) => set("annualIncreasePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ret">Invest return (%)</Label>
                <Input id="ret" type="number" step="any" inputMode="decimal" className="h-11" value={form.investReturnPct} onChange={(e) => set("investReturnPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total over the period</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalSpend) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-orange-600">
              {formatUSD(result.foregoneGrowth)} of forgone investment growth
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
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Spend vs invested chart */}
      {result && result.schedule.length > 1 && <SpendChart result={result} />}
    </div>
  );
}

function SpendChart({ result }: { result: SubscriptionResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.investedValue, p.cumulativeSpend))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const invPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.investedValue).toFixed(1)}`);
  const spendPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.cumulativeSpend).toFixed(1)}`);
  const invArea = `M${x(0)},${y(0)} L${invPts.join(" L")} L${x(years)},${y(0)} Z`;
  const invLine = `M${invPts.join(" L")}`;
  const spendLine = `M${spendPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative spend vs invested</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> If invested</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Spent</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Subscription spend versus invested chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="subFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={invArea} fill="url(#subFill)" />
        <path d={invLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={spendLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
