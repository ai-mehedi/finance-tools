"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeCapitalGains,
  formatUSD,
  formatCompact,
  type CapitalGainsResult,
  type HoldingTerm,
  type FilingStatus,
} from "@/lib/calculators/capital-gains-tax";

const TERMS: { value: HoldingTerm; label: string }[] = [
  { value: "long", label: "Long-term (held over 1 year)" },
  { value: "short", label: "Short-term (held 1 year or less)" },
];

const FILINGS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head", label: "Head of household" },
];

type FormState = {
  purchasePrice: string;
  salePrice: string;
  otherIncome: string;
  term: HoldingTerm;
  filing: FilingStatus;
};

const DEFAULTS: FormState = {
  purchasePrice: "20000",
  salePrice: "50000",
  otherIncome: "90000",
  term: "long",
  filing: "single",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): CapitalGainsResult | null {
  return computeCapitalGains({
    purchasePrice: num(f.purchasePrice) || 0,
    salePrice: num(f.salePrice) || 0,
    otherIncome: num(f.otherIncome) || 0,
    term: f.term,
    filing: f.filing,
  });
}

export default function CapitalGainsTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<CapitalGainsResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative purchase price, sale price and income.");
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
        { label: "Capital gains tax", value: result.capitalGainsTax, color: "bg-orange-500" },
        { label: "Net investment income tax", value: result.niit, color: "bg-orange-300" },
        { label: "Net proceeds after tax", value: result.netProceeds, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your sale details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the numbers, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buy">Purchase price (basis)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="buy" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="sell">Sale price (proceeds)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="sell" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="income">Other taxable income (before the gain)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.otherIncome} onChange={(e) => set("otherIncome", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="term">Holding period</Label>
                <Select id="term" className="h-11" value={form.term} onChange={(e) => set("term", e.target.value as HoldingTerm)}>
                  {TERMS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="filing">Filing status</Label>
                <Select id="filing" className="h-11" value={form.filing} onChange={(e) => set("filing", e.target.value as FilingStatus)}>
                  {FILINGS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated tax owed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalTax) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.isLoss
                ? `Capital loss of ${formatUSD(Math.abs(result.gain))} — no tax due`
                : `On a ${formatUSD(result.gain)} gain · ${(result.effectiveRate * 100).toFixed(1)}% effective rate`}
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
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Tier chart */}
      {result && !result.isLoss && result.tiers.length > 0 && <TierChart result={result} />}
    </div>
  );
}

function TierChart({ result }: { result: CapitalGainsResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 40 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.tiers;
  const maxVal = Math.max(...data.map((t) => t.amount), 1);
  const n = data.length;
  const slot = innerW / n;
  const barW = Math.min(80, slot * 0.55);

  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">How the gain is taxed</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/70" /> Gain in tier</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Capital gains tax tier chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((t, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(t.amount);
          const h = pad.t + innerH - top;
          return (
            <g key={t.label}>
              <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(0, h)} rx={4} fill="#f97316" opacity={0.85} />
              <text x={cx} y={top - 6} textAnchor="middle" className="fill-zinc-600" fontSize={10} fontWeight={700}>{formatCompact(t.amount)}</text>
              <text x={cx} y={H - 22} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{t.label}</text>
              <text x={cx} y={H - 8} textAnchor="middle" className="fill-orange-500" fontSize={10} fontWeight={700}>tax {formatCompact(t.tax)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
