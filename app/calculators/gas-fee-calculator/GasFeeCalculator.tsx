"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeGasFee,
  formatUSD,
  formatETH,
  type GasFeeResult,
} from "@/lib/calculators/gas-fee";

// Common Ethereum actions and their typical gas limit.
const PRESETS: { value: string; label: string; gas: string }[] = [
  { value: "transfer", label: "ETH transfer (21,000)", gas: "21000" },
  { value: "erc20", label: "Token transfer (65,000)", gas: "65000" },
  { value: "swap", label: "DEX swap (180,000)", gas: "180000" },
  { value: "nft", label: "NFT mint (150,000)", gas: "150000" },
  { value: "custom", label: "Custom", gas: "" },
];

type FormState = {
  preset: string;
  gasUnits: string;
  baseFeeGwei: string;
  priorityFeeGwei: string;
  ethPriceUsd: string;
};

const DEFAULTS: FormState = {
  preset: "transfer",
  gasUnits: "21000",
  baseFeeGwei: "20",
  priorityFeeGwei: "2",
  ethPriceUsd: "3000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GasFeeResult | null {
  return computeGasFee({
    gasUnits: num(f.gasUnits) || 0,
    baseFeeGwei: num(f.baseFeeGwei) || 0,
    priorityFeeGwei: num(f.priorityFeeGwei) || 0,
    ethPriceUsd: num(f.ethPriceUsd) || 0,
  });
}

export default function GasFeeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<GasFeeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onPreset(value: string) {
    const p = PRESETS.find((x) => x.value === value);
    setForm((f) => ({
      ...f,
      preset: value,
      gasUnits: value === "custom" ? f.gasUnits : (p ? p.gas : f.gasUnits),
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a gas limit greater than 0 and non-negative fees.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Transaction details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="preset">Transaction type</Label>
              <Select id="preset" className="h-11" value={form.preset} onChange={(e) => onPreset(e.target.value)}>
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="gas">Gas limit (units)</Label>
                <Input id="gas" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.gasUnits} onChange={(e) => set("gasUnits", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="eth">ETH price (USD)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="eth" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.ethPriceUsd} onChange={(e) => set("ethPriceUsd", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="base">Base fee (gwei)</Label>
                <Input id="base" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.baseFeeGwei} onChange={(e) => set("baseFeeGwei", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="prio">Priority tip (gwei)</Label>
                <Input id="prio" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.priorityFeeGwei} onChange={(e) => set("priorityFeeGwei", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total gas fee</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.feeUsd) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Fee in ETH</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatETH(result.feeEth)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Base fee
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.baseFeeUsd)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
                    Priority tip
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.priorityFeeUsd)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Total gas price <span className="font-semibold text-zinc-600">{result.totalGasPriceGwei} gwei</span>. Lower the priority tip when the network is quiet to pay less.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
