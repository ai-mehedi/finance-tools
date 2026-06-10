"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeHomeAffordability,
  formatUSD,
  formatCompact,
  type HomeAffordabilityResult,
} from "@/lib/calculators/home-affordability";

type FormState = {
  annualIncome: string;
  monthlyDebts: string;
  downPayment: string;
  annualRatePct: string;
  termYears: string;
  dtiPct: string;
  propertyTaxPct: string;
  annualInsurance: string;
};

const DEFAULTS: FormState = {
  annualIncome: "90000",
  monthlyDebts: "400",
  downPayment: "40000",
  annualRatePct: "6.5",
  termYears: "30",
  dtiPct: "36",
  propertyTaxPct: "1.1",
  annualInsurance: "1500",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HomeAffordabilityResult | null {
  return computeHomeAffordability({
    annualIncome: num(f.annualIncome),
    monthlyDebts: num(f.monthlyDebts) || 0,
    downPayment: num(f.downPayment) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
    dtiPct: num(f.dtiPct),
    propertyTaxPct: num(f.propertyTaxPct) || 0,
    annualInsurance: num(f.annualInsurance) || 0,
  });
}

export default function HomeAffordabilityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HomeAffordabilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive income, a loan term above 0, and a debt-to-income ratio between 1 and 100.");
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
        { label: "Affordable loan", value: result.loanAmount, color: "bg-zinc-300" },
        { label: "Monthly payment (PITI)", value: result.principalInterest + result.monthlyTax + result.monthlyInsurance, color: "bg-orange-300" },
        { label: "Down payment used", value: num(form.downPayment) || 0, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your finances</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Annual income</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="debts">Monthly debts</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debts" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyDebts} onChange={(e) => set("monthlyDebts", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="down">Down payment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="down" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.downPayment} onChange={(e) => set("downPayment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="ins">Insurance / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="ins" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualInsurance} onChange={(e) => set("annualInsurance", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Loan term (yr)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dti">Max DTI (%)</Label>
                <Input id="dti" type="number" step="any" inputMode="decimal" className="h-11" value={form.dtiPct} onChange={(e) => set("dtiPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tax">Property tax (% / yr)</Label>
                <Input id="tax" type="number" step="any" inputMode="decimal" className="h-11" value={form.propertyTaxPct} onChange={(e) => set("propertyTaxPct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Home you can afford</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.homePrice) : "—"}
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

      {/* Payment breakdown donut */}
      {result && result.principalInterest + result.monthlyTax + result.monthlyInsurance > 0 && (
        <PaymentDonut result={result} />
      )}
    </div>
  );
}

function PaymentDonut({ result }: { result: HomeAffordabilityResult }) {
  const slices = result.slices;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const colors = ["#f97316", "#fb923c", "#fdba74"];

  const cx = 90;
  const cy = 90;
  const r = 64;
  const stroke = 26;
  const C = 2 * Math.PI * r;

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const frac = s.value / total;
    const dash = `${(frac * C).toFixed(2)} ${(C - frac * C).toFixed(2)}`;
    const arc = { dash, offset: -offset * C, color: colors[i % colors.length] };
    offset += frac;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the monthly payment goes</h3>
      <div className="flex flex-wrap items-center gap-6">
        <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="Monthly payment breakdown donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dash}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={18} fontWeight={800}>
            {formatCompact(total)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>per month</text>
        </svg>
        <ul className="flex-1 space-y-2">
          {slices.map((s, i) => (
            <li key={s.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 font-medium text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                {s.label}
              </span>
              <span className="font-bold tabular-nums text-zinc-900">{formatUSD(s.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
