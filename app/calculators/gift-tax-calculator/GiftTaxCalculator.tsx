"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeGiftTax,
  formatUSD,
  type GiftTaxResult,
} from "@/lib/calculators/gift-tax";

// 2025 US federal figures.
const ANNUAL_EXCLUSION = 19000;
const LIFETIME_EXEMPTION = 13990000;

type FormState = {
  giftAmount: string;
  recipients: string;
  married: "single" | "married";
  lifetimeUsed: string;
};

const DEFAULTS: FormState = {
  giftAmount: "50000",
  recipients: "1",
  married: "single",
  lifetimeUsed: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GiftTaxResult | null {
  return computeGiftTax({
    giftAmount: num(f.giftAmount) || 0,
    recipients: num(f.recipients) || 0,
    isMarried: f.married === "married",
    lifetimeUsed: num(f.lifetimeUsed) || 0,
    annualExclusion: ANNUAL_EXCLUSION,
    lifetimeExemption: LIFETIME_EXEMPTION,
  });
}

export default function GiftTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<GiftTaxResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a gift amount and at least one recipient.");
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Gift details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gift">Total gift amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="gift" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.giftAmount} onChange={(e) => set("giftAmount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="recipients">Number of recipients</Label>
                <Input id="recipients" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.recipients} onChange={(e) => set("recipients", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="status">Filing status</Label>
                <Select id="status" className="h-11" value={form.married} onChange={(e) => set("married", e.target.value as FormState["married"])}>
                  <option value="single">Single donor</option>
                  <option value="married">Married (gift splitting)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="used">Lifetime exemption used</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="used" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.lifetimeUsed} onChange={(e) => set("lifetimeUsed", e.target.value)} />
                </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Gift tax due</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.giftTaxDue) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Covered by annual exclusion</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.excludedAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Counts against lifetime exemption</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.taxableGift)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Exemption left after gift</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.exemptionRemainingAfter)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.giftTaxDue > 0
                ? "Your lifetime exemption is used up, so the amount above it is taxed at 40 percent."
                : "No tax is due. The taxable portion is absorbed by your lifetime exemption, though you may still need to file Form 709."}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
