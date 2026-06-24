"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeFour01kMatch,
  formatUSD,
  type Four01kMatchResult,
} from "@/lib/calculators/401k-match";

type FormState = {
  annualSalary: string;
  contributionPct: string;
  matchRatePct: string;
  matchLimitPct: string;
};

const DEFAULTS: FormState = {
  annualSalary: "70000",
  contributionPct: "6",
  matchRatePct: "50",
  matchLimitPct: "6",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): Four01kMatchResult | null {
  return computeFour01kMatch({
    annualSalary: num(f.annualSalary) || 0,
    contributionPct: num(f.contributionPct) || 0,
    matchRatePct: num(f.matchRatePct) || 0,
    matchLimitPct: num(f.matchLimitPct) || 0,
  });
}

export default function Four01kMatchCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a salary greater than 0 and non-negative percentages." : null;

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
        { label: "Your contribution", value: result.employeeAnnual, color: "bg-orange-500" },
        { label: "Employer match", value: result.employerAnnual, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Plan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="salary">Annual salary</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="salary" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualSalary} onChange={(e) => set("annualSalary", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="contrib">You contribute (%)</Label>
                <Input id="contrib" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.contributionPct} onChange={(e) => set("contributionPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">Match rate (%)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.matchRatePct} onChange={(e) => set("matchRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="limit">Up to (% pay)</Label>
                <Input id="limit" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.matchLimitPct} onChange={(e) => set("matchLimitPct", e.target.value)} />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400">
              Example: a 50% match up to 6% of pay means your employer adds 50 cents for every dollar
              you put in, on contributions up to 6% of your salary.
            </p>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Goes in per year</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalAnnual) : "—"}
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
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.freeMoneyMissed > 0 ? (
                <>
                  You are leaving{" "}
                  <span className="font-semibold text-rose-500">{formatUSD(result.freeMoneyMissed)}</span>{" "}
                  of employer money on the table each year. Raise your contribution to capture the full match.
                </>
              ) : (
                <>You are capturing the full employer match. That is free money working for you.</>
              )}
            </p>
          )}
        </div>
      </form>

      {result && <MatchChart result={result} />}

      {/* What-if: how different contribution rates change the employer match captured. */}
      {result && <ContributionScenarios form={form} />}
    </div>
  );
}

/** Sweeps the employee contribution % so the user sees the employer match and any
 *  free money missed at 0% / 3% / match-limit / 10% / 15% plus their own value. */
function ContributionScenarios({ form }: { form: FormState }) {
  const base = num(form.contributionPct) || 0;
  const limit = num(form.matchLimitPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const pcts = Array.from(new Set([0, 3, limit, 10, 15, base]))
      .filter((p) => Number.isFinite(p) && p >= 0)
      .sort((a, b) => a - b);

    const built = pcts.map((pct) => {
      const r = compute({ ...form, contributionPct: String(pct) });
      return {
        contributionPct: pct,
        employerAnnual: r?.employerAnnual ?? 0,
        totalAnnual: r?.totalAnnual ?? 0,
        freeMoneyMissed: r?.freeMoneyMissed ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.contributionPct === base) };
  }, [form, base, limit]);

  const columns: GridColumn[] = [
    { key: "contributionPct", label: "You contribute", format: (v) => `${Number(v)}%` },
    { key: "employerAnnual", label: "Employer match", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "totalAnnual", label: "Total / year", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "freeMoneyMissed", label: "Match missed", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you changed your contribution?"
      caption="Same employer plan — only your contribution % changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="401k-match-contribution-scenarios"
    />
  );
}

function MatchChart({ result }: { result: Four01kMatchResult }) {
  const segments = [
    { label: "Your contribution", value: result.employeeAnnual, color: "#f97316" },
    { label: "Employer match", value: result.employerAnnual, color: "#fdba74" },
    { label: "Missed match", value: result.freeMoneyMissed, color: "#e4e4e7" },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  const W = 640;
  const H = 90;
  const pad = { l: 8, r: 8, t: 8, b: 8 };
  const innerW = W - pad.l - pad.r;
  const barH = 38;

  let cursor = pad.l;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where each dollar lands</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="401k contribution breakdown bar">
        {segments.map((s) => {
          const w = (s.value / total) * innerW;
          const rect = (
            <rect key={s.label} x={cursor} y={pad.t} width={Math.max(0, w - 2)} height={barH} rx={6} fill={s.color} />
          );
          cursor += w;
          return rect;
        })}
        {(() => {
          let lx = pad.l;
          return segments.map((s) => {
            const w = (s.value / total) * innerW;
            const cx = lx + w / 2;
            lx += w;
            return (
              <text key={s.label} x={cx} y={pad.t + barH + 22} textAnchor="middle" className="fill-zinc-500" fontSize={11}>
                {s.label}
              </text>
            );
          });
        })()}
      </svg>
    </div>
  );
}
