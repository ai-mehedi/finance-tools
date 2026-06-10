"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeInvoice,
  formatUSD2,
  formatCompact,
  type InvoiceResult,
} from "@/lib/calculators/invoice";

type LineState = {
  description: string;
  quantity: string;
  unitPrice: string;
};

type FormState = {
  lines: LineState[];
  discountPct: string;
  taxRatePct: string;
  shipping: string;
};

const DEFAULTS: FormState = {
  lines: [
    { description: "Design work", quantity: "10", unitPrice: "85" },
    { description: "Hosting setup", quantity: "1", unitPrice: "150" },
    { description: "Stock photos", quantity: "4", unitPrice: "12" },
  ],
  discountPct: "10",
  taxRatePct: "8.25",
  shipping: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): InvoiceResult | null {
  return computeInvoice({
    lines: f.lines.map((l) => ({
      description: l.description,
      quantity: num(l.quantity) || 0,
      unitPrice: num(l.unitPrice) || 0,
    })),
    discountPct: num(f.discountPct) || 0,
    taxRatePct: num(f.taxRatePct) || 0,
    shipping: num(f.shipping) || 0,
  });
}

export default function InvoiceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<InvoiceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Omit<FormState, "lines">>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setLine(i: number, k: keyof LineState, v: string) {
    setForm((f) => {
      const lines = f.lines.map((l, idx) => (idx === i ? { ...l, [k]: v } : l));
      return { ...f, lines };
    });
  }

  function addLine() {
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { description: "", quantity: "1", unitPrice: "0" }],
    }));
  }

  function removeLine(i: number) {
    setForm((f) => ({
      ...f,
      lines: f.lines.length > 1 ? f.lines.filter((_, idx) => idx !== i) : f.lines,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Add at least one line, keep quantities and prices non-negative, and set discount between 0 and 100.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Line items</h2>
          <p className="mt-0.5 text-sm text-zinc-500">List what you are billing, then press Calculate.</p>

          <div className="mt-5 space-y-3">
            {form.lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-5">
                  {i === 0 && <Label htmlFor={`desc-${i}`}>Description</Label>}
                  <Input
                    id={`desc-${i}`}
                    type="text"
                    className="h-11"
                    placeholder="Item"
                    value={l.description}
                    onChange={(e) => setLine(i, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label htmlFor={`qty-${i}`}>Qty</Label>}
                  <Input
                    id={`qty-${i}`}
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="h-11"
                    value={l.quantity}
                    onChange={(e) => setLine(i, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  {i === 0 && <Label htmlFor={`price-${i}`}>Unit price</Label>}
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <Input
                      id={`price-${i}`}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      className="h-11 pl-7"
                      value={l.unitPrice}
                      onChange={(e) => setLine(i, "unitPrice", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full px-0"
                    onClick={() => removeLine(i)}
                    aria-label="Remove line"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-4" /> Add line
            </Button>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.discountPct} onChange={(e) => set("discountPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tax">Tax (%)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.taxRatePct} onChange={(e) => set("taxRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="shipping">Shipping</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="shipping" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.shipping} onChange={(e) => set("shipping", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Invoice total</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.total) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Subtotal" value={formatUSD2(result.subtotal)} dot="bg-zinc-300" />
                <Row label="Discount" value={`- ${formatUSD2(result.discountAmount)}`} dot="bg-amber-400" />
                <Row label="Tax" value={formatUSD2(result.taxAmount)} dot="bg-orange-300" />
                <Row label="Shipping" value={formatUSD2(result.shipping)} dot="bg-orange-500" />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Line item detail + chart */}
      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-zinc-900">Itemised breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="pb-2 font-semibold">Item</th>
                  <th className="pb-2 text-right font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Price</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.lineResults.map((l, i) => (
                  <tr key={i} className="border-b border-zinc-50">
                    <td className="py-2 text-zinc-700">{l.description || `Item ${i + 1}`}</td>
                    <td className="py-2 text-right tabular-nums text-zinc-500">{l.quantity}</td>
                    <td className="py-2 text-right tabular-nums text-zinc-500">{formatUSD2(l.unitPrice)}</td>
                    <td className="py-2 text-right font-semibold tabular-nums text-zinc-900">{formatUSD2(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.breakdown.some((b) => b.value > 0) && <CompositionChart result={result} />}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

function CompositionChart({ result }: { result: InvoiceResult }) {
  const W = 320;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const r = 120;
  const inner = 70;

  const data = result.breakdown.filter((b) => b.value > 0);
  const total = data.reduce((s, b) => s + b.value, 0) || 1;
  const colors = ["#f97316", "#fb923c", "#fdba74"];

  let angle = -Math.PI / 2;
  const arcs = data.map((b, i) => {
    const frac = b.value / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const xi1 = cx + inner * Math.cos(end);
    const yi1 = cy + inner * Math.sin(end);
    const xi2 = cx + inner * Math.cos(start);
    const yi2 = cy + inner * Math.sin(start);
    const d = `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi1.toFixed(1)},${yi1.toFixed(1)} A${inner},${inner} 0 ${large} 0 ${xi2.toFixed(1)},${yi2.toFixed(1)} Z`;
    return { d, color: colors[i % colors.length], label: b.label, value: b.value, frac };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the total goes</h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-44" role="img" aria-label="Invoice composition donut chart">
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.color} />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={20} fontWeight={800}>
            {formatCompact(result.total)}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={11}>
            total
          </text>
        </svg>
        <ul className="space-y-2">
          {arcs.map((a, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-sm" style={{ background: a.color }} />
              <span className="font-medium text-zinc-700">{a.label}</span>
              <span className="tabular-nums text-zinc-400">{(a.frac * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
