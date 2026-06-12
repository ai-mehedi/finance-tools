"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeCashConversionCycle,
  formatDays,
  type CashConversionCycleResult,
} from "@/lib/calculators/cash-conversion-cycle";

type FormState = {
  revenue: string;
  cogs: string;
  avgInventory: string;
  avgReceivable: string;
  avgPayable: string;
};

const DEFAULTS: FormState = {
  revenue: "1200000",
  cogs: "750000",
  avgInventory: "90000",
  avgReceivable: "130000",
  avgPayable: "70000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CashConversionCycleResult | null {
  return computeCashConversionCycle({
    revenue: num(f.revenue),
    cogs: num(f.cogs),
    avgInventory: num(f.avgInventory) || 0,
    avgReceivable: num(f.avgReceivable) || 0,
    avgPayable: num(f.avgPayable) || 0,
  });
}

export default function CashConversionCycleCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CashConversionCycleResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter annual revenue and COGS above 0, plus non-negative inventory, receivable and payable balances.");
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
        { label: "Days Inventory Outstanding (DIO)", value: result.dio, color: "bg-orange-300" },
        { label: "Days Sales Outstanding (DSO)", value: result.dso, color: "bg-orange-500" },
        { label: "Days Payable Outstanding (DPO)", value: result.dpo, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Financial figures</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter annual figures and average balances, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revenue">Annual revenue</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="revenue" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.revenue} onChange={(e) => set("revenue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cogs">Cost of goods sold</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="cogs" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.cogs} onChange={(e) => set("cogs", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="inventory">Average inventory</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="inventory" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.avgInventory} onChange={(e) => set("avgInventory", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="receivable">Average accounts receivable</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="receivable" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.avgReceivable} onChange={(e) => set("avgReceivable", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="payable">Average accounts payable</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="payable" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.avgPayable} onChange={(e) => set("avgPayable", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Cash conversion cycle</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatDays(result.ccc) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.ccc < 0
                ? "Negative — suppliers finance your operating cycle."
                : "Days from paying suppliers to collecting cash."}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatDays(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Component breakdown chart */}
      {result && <CycleChart result={result} />}
    </div>
  );
}

function CycleChart({ result }: { result: CashConversionCycleResult }) {
  const rows = [
    { label: "DIO", value: result.dio, fill: "#fdba74" },
    { label: "DSO", value: result.dso, fill: "#f97316" },
    { label: "DPO", value: result.dpo, fill: "#a1a1aa" },
  ];
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cycle components (days)</h3>
        <span className="text-xs text-zinc-500">CCC = DIO + DSO − DPO</span>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-10 shrink-0 text-xs font-bold text-zinc-500">{r.label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-zinc-100">
              <div
                className="h-full rounded-md"
                style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.fill }}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-bold tabular-nums text-zinc-900">
              {r.value.toFixed(1)} d
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
