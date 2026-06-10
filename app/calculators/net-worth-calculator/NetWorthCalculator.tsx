"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeNetWorth,
  formatUSD,
  formatCompact,
  type NetWorthResult,
  type NetWorthSlice,
} from "@/lib/calculators/net-worth";

type FormState = {
  cash: string;
  investments: string;
  realEstate: string;
  vehicles: string;
  otherAssets: string;
  mortgage: string;
  loans: string;
  creditCards: string;
  otherDebts: string;
};

const DEFAULTS: FormState = {
  cash: "15000",
  investments: "85000",
  realEstate: "350000",
  vehicles: "25000",
  otherAssets: "10000",
  mortgage: "220000",
  loans: "18000",
  creditCards: "5000",
  otherDebts: "2000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): NetWorthResult | null {
  return computeNetWorth({
    cash: num(f.cash) || 0,
    investments: num(f.investments) || 0,
    realEstate: num(f.realEstate) || 0,
    vehicles: num(f.vehicles) || 0,
    otherAssets: num(f.otherAssets) || 0,
    mortgage: num(f.mortgage) || 0,
    loans: num(f.loans) || 0,
    creditCards: num(f.creditCards) || 0,
    otherDebts: num(f.otherDebts) || 0,
  });
}

const ASSET_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "cash", label: "Cash & savings" },
  { key: "investments", label: "Investments" },
  { key: "realEstate", label: "Real estate" },
  { key: "vehicles", label: "Vehicles" },
  { key: "otherAssets", label: "Other assets" },
];

const LIABILITY_FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "mortgage", label: "Mortgage" },
  { key: "loans", label: "Loans" },
  { key: "creditCards", label: "Credit cards" },
  { key: "otherDebts", label: "Other debts" },
];

export default function NetWorthCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<NetWorthResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter non-negative numbers for every asset and liability.");
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

  const positive = result ? result.netWorth >= 0 : false;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Assets &amp; liabilities</h2>
          <p className="mt-0.5 text-sm text-zinc-500">List what you own and what you owe, then press Calculate.</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-orange-500">What you own</p>
              <div className="space-y-3">
                {ASSET_FIELDS.map((fld) => (
                  <div key={fld.key}>
                    <Label htmlFor={fld.key}>{fld.label}</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={fld.key} type="number" min={0} step="any" inputMode="decimal" className="h-10 pl-7" value={form[fld.key]} onChange={(e) => set(fld.key, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">What you owe</p>
              <div className="space-y-3">
                {LIABILITY_FIELDS.map((fld) => (
                  <div key={fld.key}>
                    <Label htmlFor={fld.key}>{fld.label}</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                      <Input id={fld.key} type="number" min={0} step="any" inputMode="decimal" className="h-10 pl-7" value={form[fld.key]} onChange={(e) => set(fld.key, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-medium text-rose-500">{error}</p>}

          <div className="mt-5 flex gap-3">
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              <Calculator /> Calculate
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={reset}>
              <RotateCcw /> Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Net worth</p>
          <p className={`mt-1 text-4xl font-extrabold tracking-tight tabular-nums ${positive ? "text-zinc-900" : "text-rose-600"}`}>
            {result ? formatUSD(result.netWorth) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              {positive ? "Your assets exceed your debts." : "Your debts currently exceed your assets."}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Total assets" value={formatUSD(result.totalAssets)} dot="bg-orange-400" />
                <Row label="Total liabilities" value={formatUSD(result.totalLiabilities)} dot="bg-zinc-400" />
                <Row label="Liquid assets" value={formatUSD(result.liquidAssets)} />
                <Row label="Debt-to-asset ratio" value={`${result.debtToAssetPct.toFixed(0)}%`} />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && (result.totalAssets > 0 || result.totalLiabilities > 0) && <CompositionChart result={result} />}
    </div>
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />}
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function Donut({ title, total, slices }: { title: string; total: number; slices: NetWorthSlice[] }) {
  const size = 160;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const active = slices.filter((s) => s.value > 0);

  let offset = 0;
  const arcs = active.map((s) => {
    const frac = total > 0 ? s.value / total : 0;
    const len = frac * circ;
    const arc = { ...s, dash: len, gap: circ - len, rot: (offset / circ) * 360 };
    offset += len;
    return arc;
  });

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">{title}</p>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${title} composition`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.dash} ${a.gap}`}
              transform={`rotate(${-90 + a.rot} ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase text-zinc-400">Total</span>
          <span className="text-sm font-extrabold tabular-nums text-zinc-900">{formatCompact(total)}</span>
        </div>
      </div>
      <ul className="mt-3 w-full space-y-1">
        {active.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-semibold tabular-nums text-zinc-700">{formatCompact(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompositionChart({ result }: { result: NetWorthResult }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-zinc-900">Where your money sits</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        <Donut title="Assets" total={result.totalAssets} slices={result.assetSlices} />
        <Donut title="Liabilities" total={result.totalLiabilities} slices={result.liabilitySlices} />
      </div>
    </div>
  );
}
