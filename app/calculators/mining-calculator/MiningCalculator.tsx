"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeMining,
  formatUSD,
  formatCompact,
  type HashUnit,
  type MiningResult,
} from "@/lib/calculators/mining";

const HASH_UNITS: { value: HashUnit; label: string }[] = [
  { value: "H", label: "H/s" },
  { value: "KH", label: "KH/s" },
  { value: "MH", label: "MH/s" },
  { value: "GH", label: "GH/s" },
  { value: "TH", label: "TH/s" },
  { value: "PH", label: "PH/s" },
];

type FormState = {
  hashRate: string;
  hashUnit: HashUnit;
  powerWatts: string;
  electricityPrice: string;
  coinPrice: string;
  blockReward: string;
  blockTimeSec: string;
  networkHashRate: string;
  networkUnit: HashUnit;
  poolFeePct: string;
  hardwareCost: string;
};

const DEFAULTS: FormState = {
  hashRate: "100",
  hashUnit: "TH",
  powerWatts: "3250",
  electricityPrice: "0.10",
  coinPrice: "65000",
  blockReward: "3.125",
  blockTimeSec: "600",
  networkHashRate: "600",
  networkUnit: "PH",
  poolFeePct: "1",
  hardwareCost: "3000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MiningResult | null {
  return computeMining({
    hashRate: num(f.hashRate),
    hashUnit: f.hashUnit,
    powerWatts: num(f.powerWatts),
    electricityPrice: num(f.electricityPrice),
    coinPrice: num(f.coinPrice),
    blockReward: num(f.blockReward),
    blockTimeSec: num(f.blockTimeSec),
    networkHashRate: num(f.networkHashRate),
    networkUnit: f.networkUnit,
    poolFeePct: num(f.poolFeePct),
    hardwareCost: num(f.hardwareCost),
  });
}

export default function MiningCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MiningResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive hash rate, network hash rate and block time, a pool fee below 100 percent, and non-negative prices.");
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
        { label: "Revenue / day", value: result.revenuePerDay, color: "bg-orange-300" },
        { label: "Power cost / day", value: result.costPerDay, color: "bg-zinc-300" },
        { label: "Net profit / day", value: result.profitPerDay, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your rig and network details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hash">Your hash rate</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input id="hash" type="number" min={0} step="any" inputMode="decimal" className="col-span-2 h-11" value={form.hashRate} onChange={(e) => set("hashRate", e.target.value)} />
                  <Select aria-label="Hash unit" className="h-11 px-1.5" value={form.hashUnit} onChange={(e) => set("hashUnit", e.target.value as HashUnit)}>
                    {HASH_UNITS.map((u) => (<option key={u.value} value={u.value}>{u.label}</option>))}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="net">Network hash rate</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input id="net" type="number" min={0} step="any" inputMode="decimal" className="col-span-2 h-11" value={form.networkHashRate} onChange={(e) => set("networkHashRate", e.target.value)} />
                  <Select aria-label="Network hash unit" className="h-11 px-1.5" value={form.networkUnit} onChange={(e) => set("networkUnit", e.target.value as HashUnit)}>
                    {HASH_UNITS.map((u) => (<option key={u.value} value={u.value}>{u.label}</option>))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="power">Power draw (W)</Label>
                <Input id="power" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.powerWatts} onChange={(e) => set("powerWatts", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="elec">Electricity ($/kWh)</Label>
                <Input id="elec" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.electricityPrice} onChange={(e) => set("electricityPrice", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Coin price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.coinPrice} onChange={(e) => set("coinPrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="reward">Block reward (coins)</Label>
                <Input id="reward" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.blockReward} onChange={(e) => set("blockReward", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="blocktime">Block time (s)</Label>
                <Input id="blocktime" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.blockTimeSec} onChange={(e) => set("blockTimeSec", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="fee">Pool fee (%)</Label>
                <Input id="fee" type="number" min={0} max={99} step="any" inputMode="decimal" className="h-11" value={form.poolFeePct} onChange={(e) => set("poolFeePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hw">Rig cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="hw" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.hardwareCost} onChange={(e) => set("hardwareCost", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net profit / month</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.profitPerMonth) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              {result.breakEvenDays !== null
                ? `Payback in about ${Math.round(result.breakEvenDays)} days`
                : "Hardware does not pay back at these inputs"}
            </p>
          )}
          <div className="mt-4 space-y-2">
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
        </div>
      </form>

      {/* Cumulative profit chart */}
      {result && result.schedule.length > 1 && <ProfitChart result={result} />}
    </div>
  );
}

function ProfitChart({ result }: { result: MiningResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const vals = data.map((p) => p.cumulativeProfit);
  const maxVal = Math.max(...vals, 0);
  const minVal = Math.min(...vals, 0);
  const range = maxVal - minVal || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / range) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.cumulativeProfit).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const zeroY = y(0);
  const areaPath = `M${x(0)},${zeroY} L${pts.join(" L")} L${x(months)},${zeroY} Z`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, 6, 12, 18, 24].filter((v) => v <= months);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative profit (after rig cost)</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Net position</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative mining profit chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1} strokeDasharray="3 3" />
        <defs>
          <linearGradient id="mineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#mineFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
