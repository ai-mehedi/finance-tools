"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeWorkingCapital,
  formatUSD,
  formatRatio,
  type WorkingCapitalResult,
} from "@/lib/calculators/working-capital";

type FormState = {
  cash: string;
  receivables: string;
  inventory: string;
  otherCurrentAssets: string;
  payables: string;
  shortTermDebt: string;
  otherCurrentLiabilities: string;
};

const DEFAULTS: FormState = {
  cash: "60000",
  receivables: "85000",
  inventory: "120000",
  otherCurrentAssets: "15000",
  payables: "70000",
  shortTermDebt: "40000",
  otherCurrentLiabilities: "25000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): WorkingCapitalResult | null {
  return computeWorkingCapital({
    cash: num(f.cash) || 0,
    receivables: num(f.receivables) || 0,
    inventory: num(f.inventory) || 0,
    otherCurrentAssets: num(f.otherCurrentAssets) || 0,
    payables: num(f.payables) || 0,
    shortTermDebt: num(f.shortTermDebt) || 0,
    otherCurrentLiabilities: num(f.otherCurrentLiabilities) || 0,
  });
}

const STATUS_TEXT: Record<WorkingCapitalResult["status"], string> = {
  healthy: "Healthy cushion — current assets comfortably cover what is due within a year.",
  tight: "Tight liquidity — assets cover liabilities, but with little room to spare.",
  negative: "Negative working capital — short-term obligations exceed short-term assets.",
};

export default function WorkingCapitalCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<WorkingCapitalResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative amounts, with at least one asset or liability above 0.");
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
        { label: "Current assets", value: formatUSD(result.currentAssets), color: "bg-orange-300" },
        { label: "Current liabilities", value: formatUSD(result.currentLiabilities), color: "bg-zinc-300" },
        { label: "Current ratio", value: formatRatio(result.currentRatio), color: "bg-orange-500" },
        { label: "Quick ratio", value: formatRatio(result.quickRatio), color: "bg-orange-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Balance sheet items</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter current assets and liabilities, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Current assets</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["cash", "Cash & equivalents", form.cash],
                ["receivables", "Accounts receivable", form.receivables],
                ["inventory", "Inventory", form.inventory],
                ["otherCurrentAssets", "Other current assets", form.otherCurrentAssets],
              ] as const).map(([key, label, val]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={key} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={val} onChange={(e) => set(key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <p className="pt-1 text-xs font-bold uppercase tracking-wide text-zinc-400">Current liabilities</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["payables", "Accounts payable", form.payables],
                ["shortTermDebt", "Short-term debt", form.shortTermDebt],
                ["otherCurrentLiabilities", "Other current liabilities", form.otherCurrentLiabilities],
              ] as const).map(([key, label, val]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input id={key} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={val} onChange={(e) => set(key, e.target.value)} />
                  </div>
                </div>
              ))}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Working capital</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.workingCapital) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">{STATUS_TEXT[result.status]}</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{b.value}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Asset mix donut */}
      {result && result.assetMix.length > 0 && <AssetMixDonut result={result} />}
    </div>
  );
}

function AssetMixDonut({ result }: { result: WorkingCapitalResult }) {
  const segs = result.assetMix;
  const total = segs.reduce((s, x) => s + x.value, 0) || 1;

  const R = 80;
  const stroke = 26;
  const cx = 110;
  const cy = 110;
  const circ = 2 * Math.PI * R;

  let offset = 0;
  const arcs = segs.map((s) => {
    const frac = s.value / total;
    const dash = frac * circ;
    const arc = { color: s.color, dash, gap: circ - dash, offset: -offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Current asset mix</h3>
        <span className="text-xs text-zinc-500">Share of current assets by type</span>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <svg viewBox="0 0 220 220" className="h-44 w-44 shrink-0" role="img" aria-label="Current asset mix donut chart">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.dash.toFixed(2)} ${a.gap.toFixed(2)}`}
              strokeDashoffset={a.offset.toFixed(2)}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={15} fontWeight={700}>
            {formatUSD(result.currentAssets)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={11}>assets</text>
        </svg>
        <ul className="space-y-2">
          {segs.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="font-medium text-zinc-700">{s.label}</span>
              <span className="tabular-nums text-zinc-500">
                {formatUSD(s.value)} · {((s.value / total) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
