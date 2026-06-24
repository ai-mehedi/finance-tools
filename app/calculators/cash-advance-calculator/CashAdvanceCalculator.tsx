"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeCashAdvance,
  formatUSD2,
  type CashAdvanceResult,
} from "@/lib/calculators/cash-advance";

type FormState = {
  amount: string;
  feePct: string;
  feeMin: string;
  aprPct: string;
  daysUntilRepaid: string;
};

const DEFAULTS: FormState = {
  amount: "500",
  feePct: "5",
  feeMin: "10",
  aprPct: "29.99",
  daysUntilRepaid: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CashAdvanceResult | null {
  return computeCashAdvance({
    amount: num(f.amount),
    feePct: num(f.feePct) || 0,
    feeMin: num(f.feeMin) || 0,
    aprPct: num(f.aprPct) || 0,
    daysUntilRepaid: num(f.daysUntilRepaid) || 0,
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

export default function CashAdvanceCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a cash advance amount greater than 0 and non-negative fees." : null;

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
        { label: "Cash advance fee", value: result.fee, color: "bg-orange-500" },
        { label: "Interest", value: result.interest, color: "bg-amber-300" },
      ].filter((b) => b.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Cash advance details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="amount" label="Cash advance amount" value={form.amount} onChange={(v) => set("amount", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="feePct">Fee rate (%)</Label>
                <Input id="feePct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.feePct} onChange={(e) => set("feePct", e.target.value)} />
              </div>
              <Money id="feeMin" label="Minimum fee" value={form.feeMin} onChange={(v) => set("feeMin", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="apr">Cash advance APR (%)</Label>
                <Input id="apr" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.aprPct} onChange={(e) => set("aprPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="days">Days until repaid</Label>
                <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.daysUntilRepaid} onChange={(e) => set("daysUntilRepaid", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total cost</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.totalCost) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                      {b.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(b.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total to repay</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(result.totalRepaid)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              That is about{" "}
              <span className="font-semibold text-zinc-600">{result.effectiveCostPct.toFixed(1)}%</span> of the amount borrowed in costs.
            </p>
          )}
        </div>
      </form>

      {/* What-if: how the cost scales with the amount you advance. */}
      {result && <AmountScenarios form={form} />}
    </div>
  );
}

/** Sweeps the cash advance amount so the user sees how the fee, total cost and
 *  effective cost percentage change at a few common borrowing levels plus their
 *  own value. */
function AmountScenarios({ form }: { form: FormState }) {
  const base = num(form.amount) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const amounts = Array.from(new Set([100, 250, 500, 1000, 2000, base]))
      .filter((a) => a > 0)
      .sort((a, b) => a - b);

    const built = amounts.map((amount) => {
      const r = compute({ ...form, amount: String(amount) });
      return {
        amount,
        totalCost: r?.totalCost ?? 0,
        totalRepaid: r?.totalRepaid ?? 0,
        effectiveCostPct: r ? `${r.effectiveCostPct.toFixed(1)}%` : "—",
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.amount === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "amount", label: "Amount advanced", format: (v) => formatUSD2(Number(v)) },
    { key: "totalCost", label: "Total cost", align: "right", format: (v) => formatUSD2(Number(v)) },
    { key: "totalRepaid", label: "Total to repay", align: "right", format: (v) => formatUSD2(Number(v)) },
    { key: "effectiveCostPct", label: "Cost of amount", align: "right" },
  ];

  return (
    <ScenarioGrid
      title="What if you advanced a different amount?"
      caption="Same fee rate, APR and repayment window — only the amount borrowed changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="cash-advance-amount-scenarios"
    />
  );
}
