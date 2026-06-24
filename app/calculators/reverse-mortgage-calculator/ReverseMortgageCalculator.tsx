"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeReverseMortgage,
  formatUSD,
  formatCompact,
  PAYOUTS,
  type Payout,
  type ReverseMortgageResult,
} from "@/lib/calculators/reverse-mortgage";

type FormState = {
  homeValue: string;
  age: string;
  expectedRatePct: string;
  existingMortgage: string;
  closingCosts: string;
  payout: Payout;
  projectionYears: string;
};

const DEFAULTS: FormState = {
  homeValue: "500000",
  age: "70",
  expectedRatePct: "6.5",
  existingMortgage: "40000",
  closingCosts: "15000",
  payout: "lumpSum",
  projectionYears: "15",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): ReverseMortgageResult | null {
  return computeReverseMortgage({
    homeValue: num(f.homeValue),
    age: num(f.age),
    expectedRatePct: num(f.expectedRatePct) || 0,
    existingMortgage: num(f.existingMortgage) || 0,
    closingCosts: num(f.closingCosts) || 0,
    payout: f.payout,
    projectionYears: num(f.projectionYears),
  });
}

export default function ReverseMortgageCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a home value above 0 and a borrower age between 62 and 99."
      : null;

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
        { label: "Principal limit", value: result.principalLimit, color: "bg-zinc-300" },
        { label: "Upfront insurance", value: result.upfrontMip, color: "bg-orange-300" },
        { label: "Net cash to you", value: result.netAvailable, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="home">Home value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="home" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.homeValue} onChange={(e) => set("homeValue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="age">Youngest borrower age</Label>
                <Input id="age" type="number" min={62} max={99} step="1" inputMode="numeric" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Expected rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.expectedRatePct} onChange={(e) => set("expectedRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="payout">Payout type</Label>
                <Select id="payout" className="h-11" value={form.payout} onChange={(e) => set("payout", e.target.value as Payout)}>
                  {PAYOUTS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="mortgage">Existing mortgage</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="mortgage" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.existingMortgage} onChange={(e) => set("existingMortgage", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="costs">Closing costs</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="costs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.closingCosts} onChange={(e) => set("closingCosts", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="years">Project (yrs)</Label>
                <Input id="years" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.projectionYears} onChange={(e) => set("projectionYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net cash available</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netAvailable) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              {form.payout === "lumpSum"
                ? `Principal limit factor ${(result.principalLimitFactor * 100).toFixed(1)}%`
                : `About ${formatUSD(result.monthlyTenurePayment)} / month`}
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

      {/* Equity projection chart */}
      {result && result.schedule.length > 1 && <EquityChart result={result} />}

      {/* What-if: how borrower age changes the principal limit and net cash. */}
      {result && <AgeScenarios form={form} />}
    </div>
  );
}

/** Sweeps the youngest-borrower age so the user sees how the principal limit
 *  factor and net cash available rise at 62 / 67 / 72 / 77 / 82 plus their
 *  own age. Older borrowers qualify for a larger principal limit. */
function AgeScenarios({ form }: { form: FormState }) {
  const base = num(form.age);

  const { rows, highlightIndex } = useMemo(() => {
    const ages = Array.from(new Set([62, 67, 72, 77, 82, base]))
      .filter((a) => Number.isFinite(a) && a >= 62 && a <= 99)
      .sort((a, b) => a - b);

    const built = ages.map((age) => {
      const r = compute({ ...form, age: String(age) });
      return {
        age,
        plf: r ? `${(r.principalLimitFactor * 100).toFixed(1)}%` : "—",
        principalLimit: r?.principalLimit ?? 0,
        netAvailable: r?.netAvailable ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.age === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "age", label: "Borrower age", format: (v) => `${v} yrs` },
    { key: "plf", label: "Limit factor", align: "right" },
    { key: "principalLimit", label: "Principal limit", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "netAvailable", label: "Net cash to you", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the youngest borrower were older?"
      caption="Same home and rate — only the borrower age changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="reverse-mortgage-age-scenarios"
    />
  );
}

function EquityChart({ result }: { result: ReverseMortgageResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.homeValue, p.loanBalance))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const valuePts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.homeValue).toFixed(1)}`);
  const loanPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.loanBalance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${loanPts.join(" L")} L${x(years)},${y(0)} Z`;
  const valueLine = `M${valuePts.join(" L")}`;
  const loanLine = `M${loanPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Loan balance vs home value</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Home value</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Loan balance</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Reverse mortgage equity projection chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="rmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#rmFill)" />
        <path d={loanLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={valueLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
