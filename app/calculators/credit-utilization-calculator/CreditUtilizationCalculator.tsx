"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCreditUtilization,
  formatUSD,
  formatPct,
  type CreditUtilizationResult,
} from "@/lib/calculators/credit-utilization";

type CardRow = { balance: string; limit: string };
type FormState = { cards: CardRow[] };

const DEFAULTS: FormState = {
  cards: [
    { balance: "1200", limit: "5000" },
    { balance: "800", limit: "3000" },
    { balance: "0", limit: "2000" },
  ],
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CreditUtilizationResult | null {
  return computeCreditUtilization({
    cards: f.cards.map((c) => ({ balance: num(c.balance) || 0, limit: num(c.limit) || 0 })),
  });
}

export default function CreditUtilizationCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CreditUtilizationResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setCard(i: number, key: keyof CardRow, v: string) {
    setForm((f) => ({
      ...f,
      cards: f.cards.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)),
    }));
  }

  function addCard() {
    setForm((f) => ({ ...f, cards: [...f.cards, { balance: "0", limit: "0" }] }));
  }

  function removeCard(i: number) {
    setForm((f) => ({ ...f, cards: f.cards.filter((_, idx) => idx !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter at least one card with a limit greater than 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your cards</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Add each card balance and limit, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="space-y-3">
              {form.cards.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <div>
                    {i === 0 && <Label htmlFor={`bal-${i}`}>Balance</Label>}
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={`bal-${i}`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={c.balance} onChange={(e) => setCard(i, "balance", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    {i === 0 && <Label htmlFor={`lim-${i}`}>Credit limit</Label>}
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={`lim-${i}`} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={c.limit} onChange={(e) => setCard(i, "limit", e.target.value)} />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11"
                    onClick={() => removeCard(i)}
                    disabled={form.cards.length <= 1}
                    aria-label="Remove card"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addCard} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              + Add another card
            </button>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Overall utilization</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.overallUtilizationPct) : "—"}
          </p>
          {result && <p className="mt-1 text-sm font-bold text-zinc-600">{result.band}</p>}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total balance</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalBalance)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total limit</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalLimit)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Highest single card</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatPct(result.highestCardUtilizationPct)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.payDownTo30 > 0
                ? `Pay down ${formatUSD(result.payDownTo30)} to reach the 30% guideline.`
                : "You are already at or below the 30% guideline lenders prefer."}
            </p>
          )}
        </div>
      </form>

      {result && <UtilizationGauge result={result} />}
    </div>
  );
}

function UtilizationGauge({ result }: { result: CreditUtilizationResult }) {
  const cap = (v: number) => Math.min(100, Math.max(0, v));
  const bars = [
    { label: "Overall", pct: result.overallUtilizationPct, color: "bg-orange-500" },
    { label: "Highest card", pct: result.highestCardUtilizationPct, color: "bg-amber-400" },
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where you stand</h3>
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
