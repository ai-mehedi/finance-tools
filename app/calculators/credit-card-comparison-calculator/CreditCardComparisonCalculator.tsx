"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCardComparison,
  formatUSD,
  formatCompact,
  type ComparisonResult,
} from "@/lib/calculators/credit-card-comparison";

type FormState = {
  avgBalance: string;
  annualSpend: string;
  nameA: string;
  aprA: string;
  feeA: string;
  rewardsA: string;
  nameB: string;
  aprB: string;
  feeB: string;
  rewardsB: string;
};

const DEFAULTS: FormState = {
  avgBalance: "3000",
  annualSpend: "12000",
  nameA: "Card A",
  aprA: "19.99",
  feeA: "0",
  rewardsA: "1.5",
  nameB: "Card B",
  aprB: "15.99",
  feeB: "95",
  rewardsB: "3",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ComparisonResult | null {
  return computeCardComparison({
    avgBalance: num(f.avgBalance) || 0,
    annualSpend: num(f.annualSpend) || 0,
    cardA: {
      name: f.nameA.trim() || "Card A",
      aprPct: num(f.aprA) || 0,
      annualFee: num(f.feeA) || 0,
      rewardsRatePct: num(f.rewardsA) || 0,
    },
    cardB: {
      name: f.nameB.trim() || "Card B",
      aprPct: num(f.aprB) || 0,
      annualFee: num(f.feeB) || 0,
      rewardsRatePct: num(f.rewardsB) || 0,
    },
  });
}

function CardFields({
  prefix,
  name,
  apr,
  fee,
  rewards,
  onName,
  onApr,
  onFee,
  onRewards,
}: {
  prefix: string;
  name: string;
  apr: string;
  fee: string;
  rewards: string;
  onName: (v: string) => void;
  onApr: (v: string) => void;
  onFee: (v: string) => void;
  onRewards: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
      <div>
        <Label htmlFor={`${prefix}-name`}>Card name</Label>
        <Input id={`${prefix}-name`} type="text" className="h-11" value={name} onChange={(e) => onName(e.target.value)} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`${prefix}-apr`}>APR (%)</Label>
          <Input id={`${prefix}-apr`} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={apr} onChange={(e) => onApr(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${prefix}-fee`}>Annual fee</Label>
          <Input id={`${prefix}-fee`} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={fee} onChange={(e) => onFee(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${prefix}-rewards`}>Rewards (%)</Label>
          <Input id={`${prefix}-rewards`} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={rewards} onChange={(e) => onRewards(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export default function CreditCardComparisonCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ComparisonResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative values for balance, spend, APR, fees and rewards.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your usage</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="avgBalance">Average balance carried</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="avgBalance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.avgBalance} onChange={(e) => set("avgBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="annualSpend">Annual spend</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="annualSpend" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualSpend} onChange={(e) => set("annualSpend", e.target.value)} />
                </div>
              </div>
            </div>

            <CardFields
              prefix="a"
              name={form.nameA}
              apr={form.aprA}
              fee={form.feeA}
              rewards={form.rewardsA}
              onName={(v) => set("nameA", v)}
              onApr={(v) => set("aprA", v)}
              onFee={(v) => set("feeA", v)}
              onRewards={(v) => set("rewardsA", v)}
            />
            <CardFields
              prefix="b"
              name={form.nameB}
              apr={form.aprB}
              fee={form.feeB}
              rewards={form.rewardsB}
              onName={(v) => set("nameB", v)}
              onApr={(v) => set("aprB", v)}
              onFee={(v) => set("feeB", v)}
              onRewards={(v) => set("rewardsB", v)}
            />

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Better value</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
            {result ? result.cheaperName : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Saves <span className="font-bold text-zinc-900">{formatUSD(result.annualSavings)}</span> per year
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{result.a.name} net cost</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.a.netAnnualCost)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{result.b.name} net cost</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.b.netAnnualCost)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <CompareChart result={result} />}
    </div>
  );
}

function CompareChart({ result }: { result: ComparisonResult }) {
  const cards = [result.a, result.b];
  const maxVal = Math.max(1, ...cards.map((c) => c.netAnnualCost));

  const W = 640;
  const H = 200;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const barW = innerW / (cards.length * 2);
  const y = (v: number) => pad.t + innerH - (Math.max(0, v) / maxVal) * innerH;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Net annual cost comparison</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Credit card net annual cost comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {cards.map((c, i) => {
          const cx = pad.l + innerW * ((i + 0.5) / cards.length);
          const top = y(c.netAnnualCost);
          const cheaper = c.name === result.cheaperName;
          return (
            <g key={c.name}>
              <rect
                x={cx - barW / 2}
                y={top}
                width={barW}
                height={pad.t + innerH - top}
                rx={4}
                fill={cheaper ? "#f97316" : "#fdba74"}
              />
              <text x={cx} y={H - 20} textAnchor="middle" className="fill-zinc-600" fontSize={11} fontWeight={600}>{c.name}</text>
              <text x={cx} y={H - 7} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{formatCompact(c.netAnnualCost)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
