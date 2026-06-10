"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLotSize,
  formatUSD,
  formatCompact,
  formatLots,
  type LotSizeResult,
} from "@/lib/calculators/lot-size";

type FormState = {
  accountBalance: string;
  riskPercent: string;
  stopLossPips: string;
  pipValuePerLot: string;
};

const DEFAULTS: FormState = {
  accountBalance: "10000",
  riskPercent: "1",
  stopLossPips: "25",
  pipValuePerLot: "10",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LotSizeResult | null {
  return computeLotSize({
    accountBalance: num(f.accountBalance),
    riskPercent: num(f.riskPercent),
    stopLossPips: num(f.stopLossPips),
    pipValuePerLot: num(f.pipValuePerLot),
  });
}

export default function LotSizeCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LotSizeResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive account balance, risk percent, stop distance in pips and pip value.");
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

  const balanceNum = num(form.accountBalance) || 0;
  const safeCapital = result ? Math.max(balanceNum - result.riskAmount, 0) : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your trade</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set your account, risk and stop, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance">Account balance</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="balance" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.accountBalance} onChange={(e) => set("accountBalance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="risk">Risk per trade (%)</Label>
                <Input id="risk" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.riskPercent} onChange={(e) => set("riskPercent", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="stop">Stop loss (pips)</Label>
                <Input id="stop" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stopLossPips} onChange={(e) => set("stopLossPips", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pip">Pip value per lot</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="pip" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.pipValuePerLot} onChange={(e) => set("pipValuePerLot", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Position size</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${formatLots(result.standardLots)} lots` : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {formatLots(result.units)} units
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Cash at risk
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.riskAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" /> Mini lots
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatLots(result.miniLots)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /> Micro lots
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatLots(result.microLots)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Risk donut + comparison */}
      {result && <RiskChart result={result} balance={balanceNum} safeCapital={safeCapital} />}
    </div>
  );
}

function RiskChart({
  result,
  balance,
  safeCapital,
}: {
  result: LotSizeResult;
  balance: number;
  safeCapital: number;
}) {
  // Donut: capital at risk versus the rest of the account.
  const total = balance > 0 ? balance : 1;
  const riskFrac = Math.min(result.riskAmount / total, 1);
  const R = 70;
  const C = 2 * Math.PI * R;
  const riskLen = C * riskFrac;

  const maxLots = Math.max(...result.schedule.map((s) => s.lots)) || 1;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid items-center gap-6 sm:grid-cols-2">
        {/* Donut */}
        <div className="flex flex-col items-center">
          <h3 className="mb-3 self-start text-sm font-bold text-zinc-900">Account exposure</h3>
          <svg viewBox="0 0 200 200" className="h-44 w-44" role="img" aria-label="Capital at risk donut chart">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#f4f4f5" strokeWidth={22} />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="#f97316"
              strokeWidth={22}
              strokeLinecap="round"
              strokeDasharray={`${riskLen.toFixed(1)} ${(C - riskLen).toFixed(1)}`}
              transform="rotate(-90 100 100)"
            />
            <text x="100" y="96" textAnchor="middle" className="fill-zinc-900" fontSize={22} fontWeight={800}>
              {(riskFrac * 100).toFixed(1)}%
            </text>
            <text x="100" y="118" textAnchor="middle" className="fill-zinc-400" fontSize={11}>at risk</text>
          </svg>
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Risked {formatCompact(result.riskAmount)}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-200" /> Safe {formatCompact(safeCapital)}</span>
          </div>
        </div>

        {/* Comparison bars */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Lots by risk level</h3>
          <div className="space-y-2.5">
            {result.schedule.map((s) => {
              const w = (s.lots / maxLots) * 100;
              const active = Math.abs(s.risk - result.riskAmount) < 0.01;
              return (
                <div key={s.riskPct} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-right text-xs font-semibold text-zinc-500">{s.riskPct}%</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-md bg-zinc-100">
                    <div
                      className={`h-full rounded-md ${active ? "bg-orange-500" : "bg-orange-300"}`}
                      style={{ width: `${Math.max(w, 2)}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs font-bold tabular-nums text-zinc-700">{formatLots(s.lots)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
