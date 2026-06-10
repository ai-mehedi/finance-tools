"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeCryptoTax,
  formatUSD,
  formatCompact,
  type FilingStatus,
  type CryptoTaxResult,
} from "@/lib/calculators/crypto-tax";

const STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head", label: "Head of household" },
];

const TERMS: { value: "short" | "long"; label: string }[] = [
  { value: "short", label: "Short-term (held 1 year or less)" },
  { value: "long", label: "Long-term (held over 1 year)" },
];

type FormState = {
  proceeds: string;
  costBasis: string;
  term: "short" | "long";
  taxableIncome: string;
  filingStatus: FilingStatus;
  shortTermRatePct: string;
};

const DEFAULTS: FormState = {
  proceeds: "18000",
  costBasis: "10000",
  term: "long",
  taxableIncome: "60000",
  filingStatus: "single",
  shortTermRatePct: "24",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CryptoTaxResult | null {
  return computeCryptoTax({
    proceeds: num(f.proceeds),
    costBasis: num(f.costBasis),
    heldLongTerm: f.term === "long",
    taxableIncome: num(f.taxableIncome) || 0,
    filingStatus: f.filingStatus,
    shortTermRatePct: num(f.shortTermRatePct) || 0,
  });
}

const RATE_COLORS: Record<number, string> = { 0: "bg-zinc-300", 15: "bg-orange-300", 20: "bg-orange-500" };

export default function CryptoTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CryptoTaxResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative proceeds, cost basis, income and rate.");
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

  const isLong = form.term === "long";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your disposal</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Estimate US federal capital gains tax, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="proceeds">Sale proceeds</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="proceeds" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.proceeds} onChange={(e) => set("proceeds", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="basis">Cost basis</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="basis" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.costBasis} onChange={(e) => set("costBasis", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="term">Holding term</Label>
              <Select id="term" className="h-11" value={form.term} onChange={(e) => set("term", e.target.value as "short" | "long")}>
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            {isLong ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="income">Other taxable income</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.taxableIncome} onChange={(e) => set("taxableIncome", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Filing status</Label>
                  <Select id="status" className="h-11" value={form.filingStatus} onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="strate">Ordinary income tax rate (%)</Label>
                <Input id="strate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.shortTermRatePct} onChange={(e) => set("shortTermRatePct", e.target.value)} />
              </div>
            )}

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated tax</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.tax) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-bold text-orange-600">
              {result.isLoss
                ? `Capital loss of ${formatUSD(Math.abs(result.gain))}`
                : `Effective ${result.effectiveRatePct.toFixed(1)}% on gain`}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Capital gain</span>
                  <span className={`text-sm font-bold tabular-nums ${result.isLoss ? "text-rose-600" : "text-zinc-900"}`}>{formatUSD(result.gain)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Tax owed</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.tax)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Profit after tax</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.netProfit)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Bracket chart */}
      {result && result.schedule.length > 0 && result.taxableGain > 0 && (
        <BracketChart result={result} isLong={isLong} />
      )}
    </div>
  );
}

function BracketChart({ result, isLong }: { result: CryptoTaxResult; isLong: boolean }) {
  const W = 640;
  const H = 220;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const maxAmt = Math.max(...data.map((s) => s.amount)) || 1;
  const barW = Math.min((innerW / data.length) * 0.6, 90);
  const gap = (innerW - barW * data.length) / (data.length + 1);

  const y = (v: number) => pad.t + innerH - (v / maxAmt) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxAmt / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Gain taxed by rate band</h3>
        <span className="text-xs text-zinc-500">{isLong ? "Long-term 0% / 15% / 20%" : "Ordinary rate"}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Gain by tax bracket chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((s, i) => {
          const bx = pad.l + gap + i * (barW + gap);
          const by = y(s.amount);
          const bh = pad.t + innerH - by;
          const color = RATE_COLORS[s.ratePct] ?? "bg-orange-500";
          const fill = color === "bg-zinc-300" ? "#d4d4d8" : color === "bg-orange-300" ? "#fdba74" : "#f97316";
          return (
            <g key={i}>
              <rect x={bx} y={by} width={barW} height={Math.max(bh, 0)} rx={4} fill={fill} />
              <text x={bx + barW / 2} y={H - 20} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{s.ratePct}%</text>
              <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={9}>{formatCompact(s.amount)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
