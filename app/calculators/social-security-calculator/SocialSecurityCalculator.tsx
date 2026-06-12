"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeSocialSecurity,
  formatUSD,
  formatCompact,
  type SocialSecurityResult,
} from "@/lib/calculators/social-security";

const FRA_OPTIONS = [
  { value: "66", label: "66" },
  { value: "66.5", label: "66 and 6 months" },
  { value: "67", label: "67" },
];

type FormState = {
  fraBenefit: string;
  fullRetirementAge: string;
  claimAge: string;
};

const DEFAULTS: FormState = {
  fraBenefit: "2000",
  fullRetirementAge: "67",
  claimAge: "67",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SocialSecurityResult | null {
  return computeSocialSecurity({
    fraBenefit: num(f.fraBenefit),
    fullRetirementAge: num(f.fullRetirementAge),
    claimAge: num(f.claimAge),
  });
}

export default function SocialSecurityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SocialSecurityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a benefit above 0 and a claiming age between 62 and 70.");
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

  const pctOfFra = result ? Math.round(result.factor * 100) : 0;
  const breakdown = result
    ? [
        { label: "Percent of full benefit", value: `${pctOfFra}%`, color: "bg-orange-500" },
        { label: "Annual benefit", value: formatUSD(result.annualBenefit), color: "bg-orange-300" },
        {
          label: result.changeVsFra >= 0 ? "Monthly gain vs full age" : "Monthly cut vs full age",
          value: `${result.changeVsFra >= 0 ? "+" : "-"}${formatUSD(Math.abs(result.changeVsFra))}`,
          color: "bg-zinc-300",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Use the benefit estimate from your SSA statement, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="fra">Benefit at full retirement age (monthly)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="fra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.fraBenefit} onChange={(e) => set("fraBenefit", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fraAge">Full retirement age</Label>
                <Select id="fraAge" className="h-11" value={form.fullRetirementAge} onChange={(e) => set("fullRetirementAge", e.target.value)}>
                  {FRA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="claim">Claiming age (62 to 70)</Label>
                <Input id="claim" type="number" min={62} max={70} step={1} inputMode="numeric" className="h-11" value={form.claimAge} onChange={(e) => set("claimAge", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated monthly benefit</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.monthlyBenefit) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Claiming at age {num(form.claimAge)} of {num(form.fullRetirementAge)} full age
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

      {/* Claim-age chart */}
      {result && result.schedule.length > 1 && <ClaimAgeChart result={result} claimAge={num(form.claimAge)} />}
    </div>
  );
}

function ClaimAgeChart({ result, claimAge }: { result: SocialSecurityResult; claimAge: number }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxVal = Math.max(...data.map((p) => p.monthly)) || 1;
  const n = data.length;

  const slot = innerW / n;
  const barW = Math.max(8, slot - 12);
  const cx = (i: number) => pad.l + slot * i + slot / 2;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Monthly benefit by claiming age</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> Your age</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Other ages</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Social Security benefit by claiming age chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((p, i) => {
          const top = y(p.monthly);
          const base = y(0);
          const selected = Math.round(p.age) === Math.round(claimAge);
          return (
            <g key={p.age}>
              <rect
                x={cx(i) - barW / 2}
                y={top}
                width={barW}
                height={Math.max(0, base - top)}
                rx={3}
                fill={selected ? "#f97316" : "#fb923c"}
                fillOpacity={selected ? 1 : 0.35}
              />
              <text x={cx(i)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{p.age}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
