"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeDiscretionaryIncome,
  formatUSD,
  formatUSD2,
  type DiscretionaryIncomeResult,
} from "@/lib/calculators/discretionary-income";

type FormState = {
  annualIncome: string;
  householdSize: string;
  povertyMultiplePct: string;
  paymentPct: string;
};

const DEFAULTS: FormState = {
  annualIncome: "60000",
  householdSize: "1",
  povertyMultiplePct: "150",
  paymentPct: "10",
};

const MULTIPLES: { value: string; label: string }[] = [
  { value: "150", label: "150% (IBR, PAYE, ICR)" },
  { value: "225", label: "225% (SAVE plan)" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DiscretionaryIncomeResult | null {
  return computeDiscretionaryIncome({
    annualIncome: num(f.annualIncome) || 0,
    householdSize: num(f.householdSize) || 1,
    povertyMultiplePct: num(f.povertyMultiplePct) || 0,
    paymentPct: num(f.paymentPct) || 0,
  });
}

export default function DiscretionaryIncomeCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a non-negative income and a household size of at least 1." : null;

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
        <h2 className="text-base font-extrabold text-zinc-900">Your situation</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="income">Adjusted gross income</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="size">Household size</Label>
              <Input id="size" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.householdSize} onChange={(e) => set("householdSize", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="multiple">Poverty line multiple</Label>
              <Select id="multiple" className="h-11" value={form.povertyMultiplePct} onChange={(e) => set("povertyMultiplePct", e.target.value)}>
                {MULTIPLES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="payment">Payment share (%)</Label>
              <Input id="payment" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.paymentPct} onChange={(e) => set("paymentPct", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Discretionary income</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.discretionaryIncome) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Poverty threshold</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.povertyThreshold)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Est. annual payment</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.annualPayment)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Est. monthly payment</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.monthlyPayment)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
        {result && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Based on a {formatUSD(result.povertyGuideline)} poverty guideline for your household size.
          </p>
        )}
      </div>
    </form>

      {/* What-if: how different income levels change discretionary income and payment. */}
      {result && <IncomeScenarios form={form} />}
    </div>
  );
}

/** Sweeps adjusted gross income so the user sees how discretionary income and the
 *  estimated monthly payment shift across nearby income levels plus their own value. */
function IncomeScenarios({ form }: { form: FormState }) {
  const base = num(form.annualIncome) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const incomes = Array.from(
      new Set([40000, 60000, 80000, 100000, 120000, base])
    )
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = incomes.map((income) => {
      const r = compute({ ...form, annualIncome: String(income) });
      return {
        income,
        discretionary: r?.discretionaryIncome ?? 0,
        monthly: r?.monthlyPayment ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.income === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "income", label: "Annual income", format: (v) => formatUSD(Number(v)) },
    { key: "discretionary", label: "Discretionary income", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "monthly", label: "Est. monthly payment", align: "right", format: (v) => formatUSD2(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your income were different?"
      caption="Same household size and plan — only your adjusted gross income changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="discretionary-income-scenarios"
    />
  );
}
