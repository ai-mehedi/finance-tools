"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBrokerage,
  formatUSD,
  type BrokerageResult,
} from "@/lib/calculators/brokerage";

type FormState = {
  buyPrice: string;
  sellPrice: string;
  quantity: string;
  brokeragePct: string;
  brokerageFlatCap: string;
};

const DEFAULTS: FormState = {
  buyPrice: "100",
  sellPrice: "110",
  quantity: "100",
  brokeragePct: "0.05",
  brokerageFlatCap: "20",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BrokerageResult | null {
  return computeBrokerage({
    buyPrice: num(f.buyPrice) || 0,
    sellPrice: num(f.sellPrice) || 0,
    quantity: num(f.quantity),
    brokeragePct: num(f.brokeragePct) || 0,
    brokerageFlatCap: num(f.brokerageFlatCap) || 0,
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

export default function BrokerageCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BrokerageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a quantity greater than 0 and non-negative prices and rates.");
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
        { label: "Brokerage", value: result.brokerage, color: "bg-orange-500" },
        { label: "Regulatory charges", value: result.regulatoryCharges, color: "bg-amber-300" },
      ].filter((b) => b.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trade details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="buyPrice" label="Buy price (per share)" value={form.buyPrice} onChange={(v) => set("buyPrice", v)} />
              <Money id="sellPrice" label="Sell price (per share)" value={form.sellPrice} onChange={(v) => set("sellPrice", v)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">Brokerage (% / side)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.brokeragePct} onChange={(e) => set("brokeragePct", e.target.value)} />
              </div>
              <Money id="cap" label="Flat cap / order" value={form.brokerageFlatCap} onChange={(v) => set("brokerageFlatCap", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net profit after charges</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.netProfit) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Gross profit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.grossProfit)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total charges</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCharges)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Total turnover <span className="font-semibold text-zinc-600">{formatUSD(result.totalTurnover)}</span> · Break-even sell price{" "}
              <span className="font-semibold text-zinc-600">{formatUSD(result.breakEvenPrice)}</span> per share.
            </p>
          )}
        </div>
      </form>

      {result && result.totalCharges > 0 && <ChargesChart breakdown={breakdown} total={result.totalCharges} />}
    </div>
  );
}

function ChargesChart({ breakdown, total }: { breakdown: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your charges go</h3>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100">
        {breakdown.map((b) => (
          <div
            key={b.label}
            className={b.color}
            style={{ width: `${total > 0 ? (b.value / total) * 100 : 0}%` }}
            title={`${b.label}: ${formatUSD(b.value)}`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-zinc-500">
              <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
              {b.label}
            </span>
            <span className="font-bold tabular-nums text-zinc-900">
              {formatUSD(b.value)} <span className="font-medium text-zinc-400">({total > 0 ? ((b.value / total) * 100).toFixed(1) : "0"}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
