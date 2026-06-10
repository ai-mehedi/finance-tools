"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeHealthInsurance,
  formatUSD,
  formatCompact,
  type PlanTier,
  type CoverageRegion,
  type HealthInsuranceResult,
} from "@/lib/calculators/health-insurance";

const TIERS: { value: PlanTier; label: string }[] = [
  { value: "bronze", label: "Bronze (low premium)" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum (high cover)" },
];

const REGIONS: { value: CoverageRegion; label: string }[] = [
  { value: "low", label: "Low-cost area" },
  { value: "average", label: "Average area" },
  { value: "high", label: "High-cost area" },
];

type FormState = {
  age: string;
  tier: PlanTier;
  region: CoverageRegion;
  tobacco: "no" | "yes";
  dependents: string;
  baseRate: string;
};

const DEFAULTS: FormState = {
  age: "35",
  tier: "silver",
  region: "average",
  tobacco: "no",
  dependents: "0",
  baseRate: "300",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HealthInsuranceResult | null {
  return computeHealthInsurance({
    age: num(f.age),
    tier: f.tier,
    region: f.region,
    tobacco: f.tobacco === "yes",
    dependents: num(f.dependents) || 0,
    baseRate: num(f.baseRate),
  });
}

export default function HealthInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HealthInsuranceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an age between 0 and 99 and a benchmark premium above 0.");
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
        { label: "Tobacco surcharge", value: result.tobaccoSurcharge, color: "bg-zinc-300" },
        { label: "Dependents add-on", value: result.dependentCost, color: "bg-orange-300" },
        { label: "Annual premium", value: result.annualPremium, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your situation, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Your age</Label>
                <Input id="age" type="number" min={0} max={99} step="1" inputMode="numeric" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="base">Benchmark premium / mo</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="base" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.baseRate} onChange={(e) => set("baseRate", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tier">Plan tier</Label>
                <Select id="tier" className="h-11" value={form.tier} onChange={(e) => set("tier", e.target.value as PlanTier)}>
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="region">Area cost</Label>
                <Select id="region" className="h-11" value={form.region} onChange={(e) => set("region", e.target.value as CoverageRegion)}>
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="deps">Dependents</Label>
                <Input id="deps" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.dependents} onChange={(e) => set("dependents", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tobacco">Tobacco use</Label>
                <Select id="tobacco" className="h-11" value={form.tobacco} onChange={(e) => set("tobacco", e.target.value as "no" | "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly premium</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlyPremium) : "—"}
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

      {/* Age chart */}
      {result && result.schedule.length > 1 && <AgeChart result={result} />}
    </div>
  );
}

function AgeChart({ result }: { result: HealthInsuranceResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.monthly)) || 1;
  const n = data.length;
  const gap = 0.32; // fraction of slot used as gap
  const slot = innerW / n;
  const barW = slot * (1 - gap);

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Premium as you age</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Monthly premium</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Health insurance premium by age">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="hiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {data.map((p, i) => {
          const bx = pad.l + slot * i + (slot - barW) / 2;
          const by = y(p.monthly);
          const bh = pad.t + innerH - by;
          return (
            <g key={p.age}>
              <rect x={bx} y={by} width={barW} height={bh} rx={3} fill="url(#hiFill)" />
              <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.age}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
