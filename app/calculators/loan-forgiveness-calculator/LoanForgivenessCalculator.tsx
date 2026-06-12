"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeLoanForgiveness,
  formatUSD,
  formatCompact,
  type LoanForgivenessResult,
} from "@/lib/calculators/loan-forgiveness";

type FormState = {
  balance: string;
  annualRatePct: string;
  monthlyPayment: string;
  program: string; // months as a string, "custom" handled separately
  customMonths: string;
};

const PROGRAMS: { value: string; label: string }[] = [
  { value: "120", label: "PSLF / 10 years (120 payments)" },
  { value: "240", label: "IDR 20 years (240 payments)" },
  { value: "300", label: "IDR 25 years (300 payments)" },
  { value: "custom", label: "Custom number of months" },
];

const DEFAULTS: FormState = {
  balance: "45000",
  annualRatePct: "6",
  monthlyPayment: "280",
  program: "120",
  customMonths: "120",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function months(f: FormState): number {
  return f.program === "custom" ? num(f.customMonths) : Number(f.program);
}

function compute(f: FormState): LoanForgivenessResult | null {
  return computeLoanForgiveness({
    balance: num(f.balance),
    annualRatePct: num(f.annualRatePct) || 0,
    monthlyPayment: num(f.monthlyPayment),
    forgivenessMonths: months(f),
  });
}

export default function LoanForgivenessCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LoanForgivenessResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a balance, monthly payment and number of qualifying months all greater than 0.");
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

  const headline = result
    ? result.paysOffEarly
      ? "Nothing forgiven"
      : formatUSD(result.amountForgiven)
    : "—";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your loan & plan</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Estimate what is left to forgive. Press Calculate when ready.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance">Current balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="payment">Monthly payment</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="payment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyPayment} onChange={(e) => set("monthlyPayment", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="program">Forgiveness plan</Label>
                <Select id="program" className="h-11" value={form.program} onChange={(e) => set("program", e.target.value)}>
                  {PROGRAMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="months">Qualifying months</Label>
                <Input
                  id="months"
                  type="number"
                  min={1}
                  step="1"
                  inputMode="numeric"
                  className="h-11"
                  disabled={form.program !== "custom"}
                  value={form.program === "custom" ? form.customMonths : form.program}
                  onChange={(e) => set("customMonths", e.target.value)}
                />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated forgiven</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">{headline}</p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">You pay first</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">{result.paysOffEarly ? "Paid off in" : "Forgiveness at"}</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {result.paysOffEarly
                      ? `${Math.floor(result.monthsToPayoff / 12)} yr ${result.monthsToPayoff % 12} mo`
                      : `${Math.floor(result.monthsToForgiveness / 12)} yr ${result.monthsToForgiveness % 12} mo`}
                  </span>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-2.5 text-xs leading-5 text-zinc-500">
                  {result.paysOffEarly
                    ? "At this payment you clear the loan before reaching the forgiveness mark, so there is nothing left to forgive."
                    : "After making every qualifying payment, the remaining balance shown above would be written off."}
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Balance chart */}
      {result && result.schedule.length > 1 && <ForgivenessChart result={result} />}
    </div>
  );
}

function ForgivenessChart({ result }: { result: LoanForgivenessResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.balance, p.paid))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const paidPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.paid).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const paidLine = `M${paidPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), Math.round(years)].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance vs. paid</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Paid so far</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan forgiveness balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="lfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lfFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={paidLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
