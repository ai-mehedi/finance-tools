"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeVat,
  formatUSD2,
  formatCompact,
  type VatMode,
  type VatResult,
} from "@/lib/calculators/vat";

const MODES: { value: VatMode; label: string }[] = [
  { value: "add", label: "Add VAT (net to gross)" },
  { value: "remove", label: "Remove VAT (gross to net)" },
];

type FormState = {
  amount: string;
  ratePct: string;
  mode: VatMode;
};

const DEFAULTS: FormState = {
  amount: "100",
  ratePct: "20",
  mode: "add",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): VatResult | null {
  return computeVat({
    amount: num(f.amount),
    ratePct: num(f.ratePct) || 0,
    mode: f.mode,
  });
}

export default function VatCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<VatResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a non-negative amount and a valid VAT rate.");
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

  const amountLabel = form.mode === "remove" ? "Gross amount (incl. VAT)" : "Net amount (excl. VAT)";

  const breakdown = result
    ? [
        { label: "Net (before VAT)", value: result.net, color: "bg-zinc-300" },
        { label: `VAT at ${result.ratePct}%`, value: result.vat, color: "bg-orange-400" },
        { label: "Gross (incl. VAT)", value: result.gross, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Choose a direction, enter the figures, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="mode">Calculation</Label>
              <Select id="mode" className="h-11" value={form.mode} onChange={(e) => set("mode", e.target.value as VatMode)}>
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">{amountLabel}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="amount" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">VAT rate (%)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.ratePct} onChange={(e) => set("ratePct", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {result?.mode === "remove" ? "Net amount" : "Gross amount"}
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.mode === "remove" ? result.net : result.gross) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD2(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Split chart */}
      {result && result.gross > 0 && <SplitChart result={result} />}
    </div>
  );
}

function SplitChart({ result }: { result: VatResult }) {
  const W = 640;
  const H = 150;
  const pad = { l: 16, r: 16, t: 28, b: 36 };
  const innerW = W - pad.l - pad.r;
  const barH = 44;
  const total = result.gross || 1;

  const netW = (result.net / total) * innerW;
  const vatW = (result.vat / total) * innerW;
  const y = pad.t;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">How the price splits</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-zinc-300" /> Net</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-500" /> VAT</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Net versus VAT split of the gross price">
        <rect x={pad.l} y={y} width={Math.max(0, netW)} height={barH} rx={6} fill="#d4d4d8" />
        <rect x={pad.l + netW} y={y} width={Math.max(0, vatW)} height={barH} rx={6} fill="#f97316" />
        {netW > 50 && (
          <text x={pad.l + netW / 2} y={y + barH / 2 + 4} textAnchor="middle" className="fill-zinc-700" fontSize={12} fontWeight={700}>
            {formatCompact(result.net)}
          </text>
        )}
        {vatW > 50 && (
          <text x={pad.l + netW + vatW / 2} y={y + barH / 2 + 4} textAnchor="middle" className="fill-white" fontSize={12} fontWeight={700}>
            {formatCompact(result.vat)}
          </text>
        )}
        <text x={pad.l} y={y - 10} className="fill-zinc-400" fontSize={11}>Net price</text>
        <text x={W - pad.r} y={y - 10} textAnchor="end" className="fill-orange-500" fontSize={11}>VAT {result.ratePct}%</text>
        <text x={pad.l} y={y + barH + 24} className="fill-zinc-500" fontSize={12} fontWeight={700}>
          Gross total: {formatCompact(result.gross)}
        </text>
      </svg>
    </div>
  );
}
