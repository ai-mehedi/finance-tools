"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeLoanEligibility,
  formatUSD,
  formatUSD2,
  type LoanEligibilityResult,
} from "@/lib/calculators/loan-eligibility";

type FormState = {
  monthlyIncome: string;
  existingDebt: string;
  maxDtiPct: string;
  annualRatePct: string;
  termYears: string;
};

const DEFAULTS: FormState = {
  monthlyIncome: "6000",
  existingDebt: "500",
  maxDtiPct: "43",
  annualRatePct: "7.5",
  termYears: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LoanEligibilityResult | null {
  return computeLoanEligibility({
    monthlyIncome: num(f.monthlyIncome) || 0,
    existingDebt: num(f.existingDebt) || 0,
    maxDtiPct: num(f.maxDtiPct) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function LoanEligibilityCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a monthly income and loan term greater than 0." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your finances</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="income" label="Gross monthly income" value={form.monthlyIncome} onChange={(v) => set("monthlyIncome", v)} />
              <Money id="debt" label="Existing monthly debt" value={form.existingDebt} onChange={(v) => set("existingDebt", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="dti">Max DTI (%)</Label>
                <Input id="dti" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.maxDtiPct} onChange={(e) => set("maxDtiPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Term (years)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Eligible loan amount</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.eligibleAmount) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Affordable payment / mo</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.affordablePayment)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total repayable</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPayable)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              This is an estimate based on your debt-to-income ratio. Lenders also weigh credit score, employment and assets.
            </p>
          )}
        </div>
      </form>

      {/* Income allocation donut */}
      {result && result.affordablePayment > 0 && <IncomeDonut result={result} />}

      {/* What-if: how different interest rates change the eligible loan amount. */}
      {result && <RateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the interest rate so the user sees how their eligible loan amount and
 *  total interest change at 5% / 6% / 7% / 8% / 9% plus their own rate. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.annualRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([5, 6, 7, 8, 9, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, annualRatePct: String(rate) });
      return {
        rate,
        eligible: r?.eligibleAmount ?? 0,
        interest: r?.totalInterest ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Interest rate", format: (v) => `${Number(v)}%` },
    { key: "eligible", label: "Eligible amount", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the interest rate were different?"
      caption="Same income and term — only the interest rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="loan-eligibility-rate-scenarios"
    />
  );
}

function IncomeDonut({ result }: { result: LoanEligibilityResult }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 84;
  const rInner = 54;

  const total = result.slices.reduce((s, sl) => s + Math.max(0, sl.value), 0) || 1;

  let acc = 0;
  const arcs = result.slices
    .filter((sl) => sl.value > 0)
    .map((sl) => {
      const frac = sl.value / total;
      const start = acc * 2 * Math.PI - Math.PI / 2;
      acc += frac;
      const end = acc * 2 * Math.PI - Math.PI / 2;
      const large = frac > 0.5 ? 1 : 0;
      const x1 = cx + rOuter * Math.cos(start);
      const y1 = cy + rOuter * Math.sin(start);
      const x2 = cx + rOuter * Math.cos(end);
      const y2 = cy + rOuter * Math.sin(end);
      const xi2 = cx + rInner * Math.cos(end);
      const yi2 = cy + rInner * Math.sin(end);
      const xi1 = cx + rInner * Math.cos(start);
      const yi1 = cy + rInner * Math.sin(start);
      const d = `M${x1.toFixed(2)},${y1.toFixed(2)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${rInner},${rInner} 0 ${large} 0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`;
      return { d, color: sl.color, label: sl.label, value: sl.value, pct: frac * 100 };
    });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">How your monthly income is allocated</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44" role="img" aria-label="Income allocation donut chart">
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.color} stroke="#fff" strokeWidth={1.5} />
          ))}
        </svg>
        <ul className="space-y-2">
          {result.slices.map((sl) => (
            <li key={sl.label} className="flex items-center gap-2.5 text-sm">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: sl.color }} />
              <span className="font-medium text-zinc-600">{sl.label}</span>
              <span className="ml-auto font-bold tabular-nums text-zinc-900">{formatUSD(sl.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
