"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeCreditLimit,
  formatUSD,
  formatPct,
  type CreditLimitResult,
} from "@/lib/calculators/credit-limit";

type FormState = {
  currentLimit: string;
  currentBalance: string;
  increaseAmount: string;
};

const DEFAULTS: FormState = {
  currentLimit: "5000",
  currentBalance: "2200",
  increaseAmount: "3000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CreditLimitResult | null {
  return computeCreditLimit({
    currentLimit: num(f.currentLimit) || 0,
    currentBalance: num(f.currentBalance) || 0,
    increaseAmount: num(f.increaseAmount) || 0,
  });
}

export default function CreditLimitCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null ? "Enter a current limit greater than 0 and non-negative amounts." : null;

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
          <h2 className="text-base font-extrabold text-zinc-900">Your card</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="limit">Current credit limit</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="limit" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentLimit} onChange={(e) => set("currentLimit", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="balance">Current balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.currentBalance} onChange={(e) => set("currentBalance", e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="increase">Requested limit increase</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="increase" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.increaseAmount} onChange={(e) => set("increaseAmount", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">New utilization</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.newUtilizationPct) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Now</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.currentUtilizationPct)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Drop</span>
                  <span className="text-sm font-bold tabular-nums text-emerald-600">{formatPct(result.utilizationDropPct)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">New limit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.newLimit)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.crossesHealthyLine
                ? "This puts you at or below the 30% guideline lenders prefer."
                : `You would still be above 30%. Pay down about ${formatUSD(Math.max(0, -result.headroomAt30))} more to get there.`}
            </p>
          )}
        </div>
      </form>

      {result && <UtilizationBars result={result} />}

      {/* What-if: how different limit increases change utilization. */}
      {result && <IncreaseScenarios form={form} />}
    </div>
  );
}

/** Sweeps the requested limit increase so the user sees how a bigger or smaller
 *  bump changes their new utilization and spend headroom at the 30% line. */
function IncreaseScenarios({ form }: { form: FormState }) {
  const base = num(form.increaseAmount) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const increases = Array.from(new Set([0, 1000, 2000, 3000, 5000, 10000, base]))
      .filter((v) => v >= 0)
      .sort((a, b) => a - b);

    const built = increases.map((increase) => {
      const r = compute({ ...form, increaseAmount: String(increase) });
      return {
        increase,
        newLimit: r?.newLimit ?? 0,
        newUtil: r?.newUtilizationPct ?? 0,
        headroom: r?.headroomAt30 ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.increase === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "increase", label: "Limit increase", format: (v) => formatUSD(Number(v)) },
    { key: "newLimit", label: "New limit", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "newUtil", label: "New utilization", align: "right", format: (v) => formatPct(Number(v)) },
    { key: "headroom", label: "Headroom at 30%", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the increase were bigger or smaller?"
      caption="Same balance — only the requested limit increase changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="credit-limit-increase-scenarios"
    />
  );
}

function UtilizationBars({ result }: { result: CreditLimitResult }) {
  const cap = (v: number) => Math.min(100, Math.max(0, v));
  const bars = [
    { label: "Before", pct: result.currentUtilizationPct, color: "bg-zinc-400" },
    { label: "After", pct: result.newUtilizationPct, color: "bg-orange-500" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Utilization before and after</h3>
        <span className="text-xs text-zinc-500">Healthy zone: under 30%</span>
      </div>
      <div className="space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-600">
              <span>{b.label}</span>
              <span className="tabular-nums">{formatPct(b.pct)}</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className={`h-full rounded-full ${b.color}`} style={{ width: `${cap(b.pct)}%` }} />
              <div className="absolute inset-y-0" style={{ left: "30%" }}>
                <div className="h-full w-px bg-emerald-500/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
