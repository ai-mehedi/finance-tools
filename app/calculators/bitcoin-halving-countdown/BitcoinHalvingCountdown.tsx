"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeHalving,
  formatDate,
  formatNumber,
  formatDuration,
  formatBTC,
  type HalvingResult,
} from "@/lib/calculators/bitcoin-halving-countdown";

type FormState = {
  currentBlock: string;
  avgBlockMinutes: string;
};

// Reference block height and a 10 minute target. Users update the height from a
// block explorer for a fresher estimate.
const DEFAULTS: FormState = {
  currentBlock: "900000",
  avgBlockMinutes: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState, nowMs: number): HalvingResult | null {
  return computeHalving({
    currentBlock: num(f.currentBlock),
    avgBlockMinutes: num(f.avgBlockMinutes),
    nowMs,
  });
}

export default function BitcoinHalvingCountdown() {
  // Capture "now" once on first render so the estimate stays stable for this view.
  const [nowMs] = useState<number>(() => Date.now());
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HalvingResult | null>(() => compute(DEFAULTS, nowMs));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form, nowMs);
    if (!r) {
      setError("Enter a block height of 0 or more and an average block time above 0 minutes.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setForm(DEFAULTS);
    setResult(compute(DEFAULTS, nowMs));
    setError(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Network state</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter the latest block height, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="block">Current block height</Label>
              <Input id="block" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.currentBlock} onChange={(e) => set("currentBlock", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="avg">Average block time (minutes)</Label>
              <Input id="avg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.avgBlockMinutes} onChange={(e) => set("avgBlockMinutes", e.target.value)} />
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

            <p className="text-xs leading-relaxed text-zinc-400">
              Find the live block height on any block explorer, then paste it here for a sharper estimate.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated next halving</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatDate(result.estimatedDateMs) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Time remaining</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatDuration(result.daysRemaining)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Blocks remaining</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatNumber(result.blocksRemaining)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Reward after halving</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatBTC(result.nextSubsidy)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Halving #{result.halvingNumber} at block {formatNumber(result.nextHalvingBlock)}. Block reward drops from{" "}
              <span className="font-semibold text-zinc-600">{formatBTC(result.currentSubsidy)}</span> to{" "}
              <span className="font-semibold text-zinc-600">{formatBTC(result.nextSubsidy)}</span>.
            </p>
          )}
        </div>
      </form>

      {result && <EpochProgress result={result} />}
    </div>
  );
}

function EpochProgress({ result }: { result: HalvingResult }) {
  const pct = Math.max(0, Math.min(100, result.progressPct));
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Progress through this halving epoch</h3>
        <span className="text-sm font-bold tabular-nums text-orange-600">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
        <span>{formatNumber(result.nextHalvingBlock - 210_000)}</span>
        <span>{formatNumber(result.nextHalvingBlock)}</span>
      </div>
    </div>
  );
}
