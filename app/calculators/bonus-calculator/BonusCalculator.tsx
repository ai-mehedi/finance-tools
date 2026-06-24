"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeBonus,
  formatUSD,
  formatPct,
  type BonusResult,
} from "@/lib/calculators/bonus";

type FormState = {
  bonusAmount: string;
  federalRatePct: string;
  stateRatePct: string;
  includeFica: string;
};

const DEFAULTS: FormState = {
  bonusAmount: "5000",
  federalRatePct: "22",
  stateRatePct: "5",
  includeFica: "yes",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BonusResult | null {
  return computeBonus({
    bonusAmount: num(f.bonusAmount) || 0,
    federalRatePct: num(f.federalRatePct) || 0,
    stateRatePct: num(f.stateRatePct) || 0,
    includeFica: f.includeFica === "yes",
  });
}

export default function BonusCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a bonus amount greater than 0 and non-negative rates." : null;

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
        { label: "Net bonus", value: result.netBonus, color: "bg-orange-500" },
        { label: "Federal tax", value: result.federalTax, color: "bg-orange-300" },
        { label: "State tax", value: result.stateTax, color: "bg-amber-300" },
        { label: "Social Security", value: result.socialSecurity, color: "bg-zinc-400" },
        { label: "Medicare", value: result.medicare, color: "bg-zinc-300" },
      ].filter((b) => b.value > 0)
    : [];

  const total = result ? result.gross : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Bonus details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="bonus">Bonus amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="bonus" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.bonusAmount} onChange={(e) => set("bonusAmount", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fed">Federal rate (%)</Label>
                <Input id="fed" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.federalRatePct} onChange={(e) => set("federalRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="state">State rate (%)</Label>
                <Input id="state" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stateRatePct} onChange={(e) => set("stateRatePct", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="fica">Include FICA (Social Security + Medicare)</Label>
              <Select id="fica" className="h-11" value={form.includeFica} onChange={(e) => set("includeFica", e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Take-home bonus</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netBonus) : "—"}
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
              Total withheld <span className="font-semibold text-zinc-600">{formatUSD(result.totalWithheld)}</span> · Effective rate{" "}
              <span className="font-semibold text-zinc-600">{formatPct(result.effectiveRatePct)}</span>.
            </p>
          )}
        </div>
      </form>

      {result && total > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your bonus goes</h3>
          <div className="flex h-6 w-full overflow-hidden rounded-full">
            {breakdown.map((b) => (
              <div
                key={b.label}
                className={b.color}
                style={{ width: `${(b.value / total) * 100}%` }}
                title={`${b.label}: ${formatUSD(b.value)}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {breakdown.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                {b.label} {((b.value / total) * 100).toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* What-if: how different federal supplemental rates change take-home pay. */}
      {result && <FederalRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the federal supplemental rate so the user sees their net bonus and
 *  effective rate at common withholding rates plus their own value. */
function FederalRateScenarios({ form }: { form: FormState }) {
  const base = num(form.federalRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([0, 10, 12, 22, 24, 37, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, federalRatePct: String(rate) });
      return {
        rate,
        net: r?.netBonus ?? 0,
        federal: r?.federalTax ?? 0,
        effective: r?.effectiveRatePct ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Federal rate", format: (v) => formatPct(Number(v)) },
    { key: "federal", label: "Federal tax", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "net", label: "Net bonus", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "effective", label: "Effective rate", align: "right", format: (v) => formatPct(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if your federal withholding rate were different?"
      caption="Same bonus — only the flat federal supplemental rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="bonus-federal-rate-scenarios"
    />
  );
}
