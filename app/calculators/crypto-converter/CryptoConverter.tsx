"use client";

import { useState } from "react";
import { Calculator, RotateCcw, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeCryptoConverter,
  ASSETS,
  formatUSD,
  formatAmount,
  formatCompact,
  type CryptoConverterResult,
} from "@/lib/calculators/crypto-converter";

type FormState = {
  amount: string;
  from: string; // symbol
  to: string; // symbol
};

const DEFAULTS: FormState = {
  amount: "1",
  from: "BTC",
  to: "USD",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));
const rateOf = (symbol: string) => ASSETS.find((a) => a.symbol === symbol)?.usd ?? NaN;

function compute(f: FormState): CryptoConverterResult | null {
  return computeCryptoConverter({
    amount: num(f.amount),
    fromUsd: rateOf(f.from),
    toUsd: rateOf(f.to),
  });
}

export default function CryptoConverter() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CryptoConverterResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative amount and pick two assets with valid prices.");
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

  function swap() {
    setForm((f) => {
      const next = { ...f, from: f.to, to: f.from };
      // Recompute immediately so the swap feels instant but stays deterministic.
      setResult(compute(next));
      setError(null);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Convert</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Pick assets and an amount, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div>
                <Label htmlFor="from">From</Label>
                <Select id="from" className="h-11" value={form.from} onChange={(e) => set("from", e.target.value)}>
                  {ASSETS.map((a) => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
                  ))}
                </Select>
              </div>
              <Button type="button" variant="outline" size="icon" className="mb-0.5 h-11 w-11" onClick={swap} aria-label="Swap from and to">
                <ArrowUpDown />
              </Button>
              <div>
                <Label htmlFor="to">To</Label>
                <Select id="to" className="h-11" value={form.to} onChange={(e) => set("to", e.target.value)}>
                  {ASSETS.map((a) => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
                  ))}
                </Select>
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

            <p className="text-xs leading-5 text-zinc-400">
              Prices are static reference rates for illustration, not live market quotes. Check an
              exchange for the latest price before trading.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Converted amount</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${formatAmount(result.result)} ${form.to}` : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Value in USD</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.usdValue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">1 {form.from} =</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatAmount(result.rate)} {form.to}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">1 {form.to} =</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatAmount(result.inverseRate)} {form.from}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Quick reference bar chart: 1 unit of each asset in USD */}
      <PriceChart highlight={[form.from, form.to]} />
    </div>
  );
}

function PriceChart({ highlight }: { highlight: string[] }) {
  // Show only crypto assets so the USD scale stays meaningful.
  const data = ASSETS.filter((a) => a.crypto);
  const W = 640;
  const rowH = 30;
  const pad = { l: 64, r: 70, t: 8, b: 8 };
  const H = pad.t + pad.b + data.length * rowH;
  const innerW = W - pad.l - pad.r;
  const maxVal = Math.max(...data.map((a) => a.usd)) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Reference price of 1 coin in USD</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Reference prices per coin in USD">
        {data.map((a, i) => {
          const y = pad.t + i * rowH;
          const w = (a.usd / maxVal) * innerW;
          const active = highlight.includes(a.symbol);
          return (
            <g key={a.symbol}>
              <text x={pad.l - 8} y={y + rowH / 2 + 3} textAnchor="end" fontSize={11} className={active ? "fill-orange-600 font-bold" : "fill-zinc-500"}>{a.symbol}</text>
              <rect x={pad.l} y={y + 5} width={Math.max(w, 2)} height={rowH - 12} rx={3} fill={active ? "#f97316" : "#fdba74"} />
              <text x={pad.l + Math.max(w, 2) + 6} y={y + rowH / 2 + 3} fontSize={10} className="fill-zinc-400">{formatCompact(a.usd)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
