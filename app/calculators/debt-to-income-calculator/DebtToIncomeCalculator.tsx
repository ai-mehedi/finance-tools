"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeDti,
  formatUSD,
  formatPct,
  type DtiResult,
} from "@/lib/calculators/debt-to-income";

type FormState = {
  income: string;
  housing: string;
  car: string;
  cards: string;
  loans: string;
  other: string;
};

const DEFAULTS: FormState = {
  income: "6000",
  housing: "1600",
  car: "400",
  cards: "150",
  loans: "300",
  other: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): DtiResult | null {
  return computeDti({
    grossMonthlyIncome: num(f.income),
    housingPayment: num(f.housing) || 0,
    carPayments: num(f.car) || 0,
    creditCardPayments: num(f.cards) || 0,
    loanPayments: num(f.loans) || 0,
    otherDebt: num(f.other) || 0,
  });
}

const RATING_COLOR: Record<string, string> = {
  Excellent: "text-emerald-600",
  Good: "text-emerald-600",
  Caution: "text-amber-600",
  High: "text-rose-600",
};

const BAR_COLORS = ["bg-orange-500", "bg-orange-400", "bg-amber-400", "bg-amber-300", "bg-zinc-300"];

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

export default function DebtToIncomeCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null
    ? "Enter a gross monthly income greater than 0 and non-negative debt amounts."
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

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Income and debts</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Use monthly amounts before tax, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="income" label="Gross monthly income" value={form.income} onChange={(v) => set("income", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Money id="housing" label="Rent or mortgage" value={form.housing} onChange={(v) => set("housing", v)} />
              <Money id="car" label="Car payments" value={form.car} onChange={(v) => set("car", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Money id="cards" label="Credit card minimums" value={form.cards} onChange={(v) => set("cards", v)} />
              <Money id="loans" label="Student / personal loans" value={form.loans} onChange={(v) => set("loans", v)} />
            </div>
            <Money id="other" label="Other monthly debt" value={form.other} onChange={(v) => set("other", v)} />

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Debt to income ratio</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.dtiPct) : "—"}
          </p>
          {result && (
            <p className={`mt-1 text-sm font-bold ${RATING_COLOR[result.rating]}`}>
              {result.rating} · <span className="font-medium text-zinc-500">{result.ratingNote}</span>
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total monthly debt</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalDebt)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Housing ratio (front-end)</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.frontEndPct)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.components.length > 0 && <BreakdownChart result={result} />}

      {/* What-if: how a higher gross monthly income changes your DTI ratio. */}
      {result && <IncomeScenarios form={form} />}
    </div>
  );
}

/** Sweeps gross monthly income so the user sees how a raise (or a pay cut)
 *  moves their back-end DTI ratio and rating, keeping all debts the same. */
function IncomeScenarios({ form }: { form: FormState }) {
  const base = num(form.income);

  const { rows, highlightIndex } = useMemo(() => {
    const incomes = Array.from(
      new Set([4000, 5000, 6000, 7500, 10000, base])
    )
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);

    const built = incomes.map((income) => {
      const r = compute({ ...form, income: String(income) });
      return {
        income,
        dti: r ? formatPct(r.dtiPct) : "—",
        frontEnd: r ? formatPct(r.frontEndPct) : "—",
        rating: r ? r.rating : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.income === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "income", label: "Gross income / mo", format: (v) => formatUSD(Number(v)) },
    { key: "dti", label: "DTI ratio", align: "right" },
    { key: "frontEnd", label: "Housing ratio", align: "right" },
    { key: "rating", label: "Rating", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if your income changed?"
      caption="Same monthly debts — only your gross monthly income changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="debt-to-income-scenarios"
    />
  );
}

function BreakdownChart({ result }: { result: DtiResult }) {
  const total = result.totalDebt || 1;
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Where your debt payments go</h3>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-100">
        {result.components.map((c, i) => (
          <div
            key={c.label}
            className={BAR_COLORS[i % BAR_COLORS.length]}
            style={{ width: `${(c.value / total) * 100}%` }}
            title={`${c.label}: ${formatUSD(c.value)}`}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {result.components.map((c, i) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
            <span className="text-zinc-500">{c.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-zinc-700">{formatUSD(c.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
