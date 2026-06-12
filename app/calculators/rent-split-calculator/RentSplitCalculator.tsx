"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeRentSplit,
  formatUSD,
  type SplitMethod,
  type RentSplitResult,
} from "@/lib/calculators/rent-split";

const METHODS: { value: SplitMethod; label: string }[] = [
  { value: "even", label: "Split evenly" },
  { value: "room", label: "By room size" },
  { value: "income", label: "By income" },
];

type Row = { name: string; roomSize: string; income: string };

type FormState = {
  totalRent: string;
  utilities: string;
  method: SplitMethod;
  rows: Row[];
};

const DEFAULTS: FormState = {
  totalRent: "2400",
  utilities: "300",
  method: "room",
  rows: [
    { name: "Alex", roomSize: "180", income: "4500" },
    { name: "Sam", roomSize: "140", income: "3800" },
    { name: "Jordan", roomSize: "120", income: "3200" },
  ],
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RentSplitResult | null {
  return computeRentSplit({
    totalRent: num(f.totalRent),
    utilities: num(f.utilities) || 0,
    method: f.method,
    roommates: f.rows.map((r) => ({
      name: r.name,
      roomSize: num(r.roomSize) || 0,
      income: num(r.income) || 0,
    })),
  });
}

const DONUT_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ea580c", "#c2410c"];

export default function RentSplitCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RentSplitResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setRow(i: number, k: keyof Row, v: string) {
    setForm((f) => ({
      ...f,
      rows: f.rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)),
    }));
  }

  function addRow() {
    setForm((f) => ({ ...f, rows: [...f.rows, { name: "", roomSize: "", income: "" }] }));
  }

  function removeRow(i: number) {
    setForm((f) => ({
      ...f,
      rows: f.rows.length > 2 ? f.rows.filter((_, j) => j !== i) : f.rows,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a total rent above 0 and at least two roommates.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Add each roommate, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rent">Total rent</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="rent" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.totalRent} onChange={(e) => set("totalRent", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="utils">Utilities</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="utils" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.utilities} onChange={(e) => set("utilities", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="method">Method</Label>
                <Select id="method" className="h-11" value={form.method} onChange={(e) => set("method", e.target.value as SplitMethod)}>
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_5.5rem_5.5rem_2rem] items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                <span>Roommate</span>
                <span>Room sq ft</span>
                <span>Income / mo</span>
                <span />
              </div>
              {form.rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_5.5rem_5.5rem_2rem] items-center gap-2">
                  <Input aria-label={`Name ${i + 1}`} type="text" className="h-10" placeholder={`Roommate ${i + 1}`} value={r.name} onChange={(e) => setRow(i, "name", e.target.value)} />
                  <Input aria-label={`Room size ${i + 1}`} type="number" min={0} step="any" inputMode="decimal" className="h-10" value={r.roomSize} onChange={(e) => setRow(i, "roomSize", e.target.value)} />
                  <Input aria-label={`Income ${i + 1}`} type="number" min={0} step="any" inputMode="decimal" className="h-10" value={r.income} onChange={(e) => setRow(i, "income", e.target.value)} />
                  <button type="button" onClick={() => removeRow(i)} disabled={form.rows.length <= 2} className="flex h-10 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30" aria-label={`Remove roommate ${i + 1}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                <Plus className="size-4" /> Add roommate
              </button>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total each month</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.grandTotal) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              result.shares.map((s, i) => (
                <div key={s.name + i} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    {s.name}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(s.total)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs text-zinc-500">
              Even split would be {formatUSD(result.evenBaseline)} per person.
            </p>
          )}
        </div>
      </form>

      {result && result.shares.length > 0 && <ShareDonut result={result} />}
    </div>
  );
}

function ShareDonut({ result }: { result: RentSplitResult }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const stroke = 30;
  const total = result.shares.reduce((a, s) => a + s.total, 0) || 1;

  let offset = 0;
  const segments = result.shares.map((s, i) => {
    const frac = s.total / total;
    const seg = {
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      dash: frac * Math.PI * 2 * r,
      gap: Math.PI * 2 * r,
      rotation: (offset / total) * 360 - 90,
      name: s.name,
      pct: frac * 100,
    };
    offset += s.total;
    return seg;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Who pays what</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48" role="img" aria-label="Rent share donut chart">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash.toFixed(2)} ${seg.gap.toFixed(2)}`}
              transform={`rotate(${seg.rotation} ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={15} fontWeight={800}>
            {result.shares.length}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            roommates
          </text>
        </svg>
        <div className="w-full max-w-[16rem] space-y-2">
          {result.shares.map((s, i) => (
            <div key={s.name + i} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                {s.name}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">{s.percent.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
