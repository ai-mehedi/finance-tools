"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<Four01kMatchResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a salary greater than 0 and non-negative percentages.");
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
        { label: "Your contribution", value: result.employeeAnnual, color: "bg-orange-500" },
        { label: "Employer match", value: result.employerAnnual, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
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
    </div>
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
