"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeRuleOf72,
  formatUSD,
  formatCompact,
  formatYears,
  type SolveFor,
  type RuleOf72Result,
} from "@/lib/calculators/rule-of-72";

const SOLVE_OPTIONS: { value: SolveFor; label: string }[] = [
  { value: "years", label: "Years to double (from a rate)" },
  { value: "rate", label: "Rate needed (from a horizon)" },
];

type FormState = {
  solveFor: SolveFor;
  ratePct: string;
  years: string;
  principal: string;
};

const DEFAULTS: FormState = {
  solveFor: "years",
  ratePct: "8",
  years: "9",
  principal: "10000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RuleOf72Result | null {
  return computeRuleOf72({
    solveFor: f.solveFor,
    ratePct: num(f.ratePct),
    years: num(f.years),
    principal: num(f.principal) || 0,
  });
}

export default function RuleOf72Calculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RuleOf72Result | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError(
        form.solveFor === "years"
          ? "Enter a return rate greater than 0."
          : "Enter a number of years greater than 0."
      );
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

  const solvingYears = form.solveFor === "years";

  const headline = result
    ? solvingYears
      ? formatYears(result.ruleYears)
      : `${result.rulePct.toFixed(2)}%`
    : "—";

  const headlineLabel = solvingYears ? "Years to double (Rule of 72)" : "Rate needed (Rule of 72)";

  const breakdown = result
    ? solvingYears
      ? [
          { label: "Rule of 72 estimate", value: formatYears(result.ruleYears), color: "bg-orange-500" },
          { label: "Exact doubling time", value: formatYears(result.exactYears), color: "bg-orange-300" },
          { label: "Return rate used", value: `${result.rulePct.toFixed(2)}%`, color: "bg-zinc-300" },
        ]
      : [
          { label: "Rule of 72 rate", value: `${result.rulePct.toFixed(2)}%`, color: "bg-orange-500" },
          { label: "Exact rate to double", value: `${result.exactRatePct.toFixed(2)}%`, color: "bg-orange-300" },
          { label: "Horizon", value: formatYears(result.ruleYears), color: "bg-zinc-300" },
        ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Pick what to solve for, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="solve">Solve for</Label>
              <Select id="solve" className="h-11" value={form.solveFor} onChange={(e) => set("solveFor", e.target.value as SolveFor)}>
                {SOLVE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Annual return (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="any"
                  min={0}
                  inputMode="decimal"
                  className="h-11"
                  disabled={!solvingYears}
                  value={form.ratePct}
                  onChange={(e) => set("ratePct", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input
                  id="years"
                  type="number"
                  step="any"
                  min={0}
                  inputMode="decimal"
                  className="h-11"
                  disabled={solvingYears}
                  value={form.years}
                  onChange={(e) => set("years", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="principal">Starting amount (for the chart)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="principal" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.principal} onChange={(e) => set("principal", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{headlineLabel}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {headline}
          </p>
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

      {/* Doublings chart */}
      {result && result.schedule.length > 1 && <DoublingChart result={result} />}
    </div>
  );
}

function DoublingChart({ result }: { result: RuleOf72Result }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxYears = data[data.length - 1].years || 1;
  const maxVal = Math.max(...data.map((p) => p.value)) || 1;

  const x = (yr: number) => pad.l + (yr / maxYears) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.years).toFixed(1)},${y(p.value).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(maxYears)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Each doubling, year by year</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Doubling</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Rule of 72 doubling chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="r72Fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#r72Fill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p) => (
          <circle key={p.doublings} cx={x(p.years)} cy={y(p.value)} r={3.5} fill="#f97316" />
        ))}
        {data.map((p) => (
          <text key={`t-${p.doublings}`} x={x(p.years)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            {p.years.toFixed(0)}y
          </text>
        ))}
      </svg>
      <p className="mt-2 text-xs text-zinc-500">
        Starting from {formatUSD(result.principal)}, each marker is one doubling at the exact rate.
      </p>
    </div>
  );
}
