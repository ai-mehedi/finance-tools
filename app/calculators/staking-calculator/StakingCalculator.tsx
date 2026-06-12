"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeStaking,
  formatUSD,
  formatTokens,
  formatCompact,
  type Compounding,
  type StakingResult,
} from "@/lib/calculators/staking";

const COMPOUND_OPTIONS: { value: Compounding; label: string }[] = [
  { value: "none", label: "No restaking (simple)" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

type FormState = {
  stakeTokens: string;
  apyPct: string;
  years: string;
  compounding: Compounding;
  tokenPriceUsd: string;
};

const DEFAULTS: FormState = {
  stakeTokens: "1000",
  apyPct: "8",
  years: "3",
  compounding: "daily",
  tokenPriceUsd: "2",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): StakingResult | null {
  return computeStaking({
    stakeTokens: num(f.stakeTokens) || 0,
    apyPct: num(f.apyPct) || 0,
    years: num(f.years),
    compounding: f.compounding,
    tokenPriceUsd: num(f.tokenPriceUsd) || 0,
  });
}

export default function StakingCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<StakingResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a horizon greater than 0 years and non-negative amounts.");
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

  const showUsd = (num(form.tokenPriceUsd) || 0) > 0;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your stake, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="stake">Tokens staked</Label>
                <Input id="stake" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stakeTokens} onChange={(e) => set("stakeTokens", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="price">Token price (USD)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.tokenPriceUsd} onChange={(e) => set("tokenPriceUsd", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="apy">APY (% / yr)</Label>
                <Input id="apy" type="number" step="any" inputMode="decimal" className="h-11" value={form.apyPct} onChange={(e) => set("apyPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="years">Years</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="comp">Restaking</Label>
                <Select id="comp" className="h-11" value={form.compounding} onChange={(e) => set("compounding", e.target.value as Compounding)}>
                  {COMPOUND_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
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
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Final balance</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? `${formatTokens(result.finalTokens)}` : "—"}
          </p>
          {result && showUsd && (
            <p className="mt-0.5 text-sm font-semibold text-zinc-500 tabular-nums">≈ {formatUSD(result.finalUsd)}</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" /> Initial stake
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatTokens(result.initialTokens)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Reward tokens
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatTokens(result.rewardTokens)}</span>
                </div>
                {showUsd && (
                  <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                    <span className="text-sm font-medium text-zinc-500">Reward value</span>
                    <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.rewardUsd)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg bg-orange-500/10 px-3 py-2.5">
                  <span className="text-sm font-bold text-orange-700">Effective APY</span>
                  <span className="text-sm font-extrabold tabular-nums text-orange-700">{result.effectiveApyPct.toFixed(2)}%</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Growth chart */}
      {result && result.schedule.length > 1 && <StakingChart result={result} showUsd={showUsd} tokenPrice={num(form.tokenPriceUsd) || 0} />}
    </div>
  );
}

function StakingChart({ result, showUsd, tokenPrice }: { result: StakingResult; showUsd: boolean; tokenPrice: number }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const toVal = (tokens: number) => (showUsd ? tokens * tokenPrice : tokens);
  const maxVal = Math.max(...data.map((p) => toVal(p.balance))) || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const balPts = data.map((p) => `${x(p.year).toFixed(1)},${y(toVal(p.balance)).toFixed(1)}`);
  const stakePts = data.map((p) => `${x(p.year).toFixed(1)},${y(toVal(result.initialTokens)).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${balPts.join(" L")} L${x(years)},${y(0)} Z`;
  const balLine = `M${balPts.join(" L")}`;
  const stakeLine = `M${stakePts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);
  const fmtAxis = (v: number) => (showUsd ? formatCompact(v) : formatCompact(v).replace("$", ""));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">{showUsd ? "Value over time" : "Tokens over time"}</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Balance</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Initial stake</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Staking rewards growth chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{fmtAxis(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="stakeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#stakeFill)" />
        <path d={balLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={stakeLine} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
