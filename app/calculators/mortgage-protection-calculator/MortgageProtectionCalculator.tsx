"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeMortgageProtection,
  formatUSD,
  formatCompact,
  type CoverageType,
  type MortgageProtectionResult,
} from "@/lib/calculators/mortgage-protection";

type FormState = {
  balance: string;
  annualRatePct: string;
  termYears: string;
  age: string;
  smoker: "yes" | "no";
  coverageType: CoverageType;
};

const DEFAULTS: FormState = {
  balance: "280000",
  annualRatePct: "6",
  termYears: "25",
  age: "38",
  smoker: "no",
  coverageType: "decreasing",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MortgageProtectionResult | null {
  return computeMortgageProtection({
    balance: num(f.balance),
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
    age: num(f.age),
    smoker: f.smoker === "yes",
    coverageType: f.coverageType,
  });
}

export default function MortgageProtectionCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a balance and term greater than 0, and an age between 18 and 75." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const breakdown = result
    ? [
        { label: "Coverage needed", value: result.recommendedCoverage, color: "bg-zinc-300" },
        { label: "Annual premium", value: result.estimatedAnnualPremium, color: "bg-orange-300" },
        { label: "Premiums over term", value: result.totalPremiumOverTerm, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your mortgage and cover</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set the loan and applicant details, then Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance">Mortgage balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Interest rate (%)</Label>
                <Input id="rate" type="number" step="any" min={0} inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="term">Remaining term (yrs)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="age">Your age</Label>
                <Input id="age" type="number" min={18} max={75} step="1" inputMode="numeric" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cover">Cover type</Label>
                <Select id="cover" className="h-11" value={form.coverageType} onChange={(e) => set("coverageType", e.target.value as CoverageType)}>
                  <option value="decreasing">Decreasing term</option>
                  <option value="level">Level term</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="smoker">Smoker</Label>
                <Select id="smoker" className="h-11" value={form.smoker} onChange={(e) => set("smoker", e.target.value as "yes" | "no")}>
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated monthly premium</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.estimatedMonthlyPremium) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Covers {formatUSD(result.recommendedCoverage)} — about {formatUSD(result.ratePer1000)} per $1,000/mo
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

      {/* Coverage chart */}
      {result && result.schedule.length > 1 && <ProtectionChart result={result} />}

      {/* What-if: how the applicant's age at purchase changes the premium. */}
      {result && <AgeScenarios form={form} />}
    </div>
  );
}

/** Sweeps the applicant's age so the user sees how locking in cover earlier (or
 *  later) changes the monthly premium and the total paid over the term. */
function AgeScenarios({ form }: { form: FormState }) {
  const base = num(form.age);

  const { rows, highlightIndex } = useMemo(() => {
    const ages = Array.from(new Set([30, 40, 50, 60, 70, base]))
      .filter((a) => Number.isFinite(a) && a >= 18 && a <= 75)
      .sort((a, b) => a - b);

    const built = ages.map((age) => {
      const r = compute({ ...form, age: String(age) });
      return {
        age,
        monthly: r?.estimatedMonthlyPremium ?? 0,
        total: r?.totalPremiumOverTerm ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.age === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "age", label: "Age at purchase", format: (v) => `${Number(v)} yrs` },
    { key: "monthly", label: "Monthly premium", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "total", label: "Total over term", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you took cover at a different age?"
      caption="Same mortgage and cover type — only the applicant's age changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="mortgage-protection-age-scenarios"
    />
  );
}

function ProtectionChart({ result }: { result: MortgageProtectionResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.coverage, p.mortgageBalance))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const coverPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.coverage).toFixed(1)}`);
  const mortPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.mortgageBalance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${coverPts.join(" L")} L${x(years)},${y(0)} Z`;
  const coverLine = `M${coverPts.join(" L")}`;
  const mortLine = `M${mortPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cover versus mortgage balance</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Policy cover</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Mortgage owed</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Mortgage protection coverage chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="protFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#protFill)" />
        <path d={coverLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={mortLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
