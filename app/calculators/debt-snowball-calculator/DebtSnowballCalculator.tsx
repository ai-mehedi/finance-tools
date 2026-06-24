"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSnowball,
  formatUSD,
  formatMonths,
  formatCompact,
  type SnowballResult,
} from "@/lib/calculators/debt-snowball";

type DebtRow = { name: string; balance: string; rate: string; min: string };

type FormState = {
  debts: DebtRow[];
  extra: string;
};

const DEFAULTS: FormState = {
  debts: [
    { name: "Credit card", balance: "1200", rate: "22", min: "35" },
    { name: "Car loan", balance: "8000", rate: "6.5", min: "180" },
    { name: "Student loan", balance: "15000", rate: "5", min: "160" },
  ],
  extra: "200",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SnowballResult | null {
  return computeSnowball({
    debts: f.debts.map((d) => ({
      name: d.name.trim() || "Debt",
      balance: num(d.balance) || 0,
      annualRatePct: num(d.rate) || 0,
      minPayment: num(d.min) || 0,
    })),
    extraPayment: num(f.extra) || 0,
  });
}

export default function DebtSnowballCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<SnowballResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setDebt(i: number, k: keyof DebtRow, v: string) {
    setForm((f) => ({
      ...f,
      debts: f.debts.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)),
    }));
  }

  function addDebt() {
    setForm((f) => ({ ...f, debts: [...f.debts, { name: "", balance: "", rate: "", min: "" }] }));
  }

  function removeDebt(i: number) {
    setForm((f) => ({ ...f, debts: f.debts.filter((_, idx) => idx !== i) }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Add at least one debt with a balance, and a budget high enough to beat the interest.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your debts</h2>
          <p className="mt-0.5 text-sm text-zinc-500">List each debt, then press Calculate.</p>

          <div className="mt-5 space-y-3">
            <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.9fr_auto] gap-2 px-1 text-xs font-semibold text-zinc-400 sm:grid">
              <span>Name</span>
              <span>Balance</span>
              <span>Rate %</span>
              <span>Min / mo</span>
              <span />
            </div>
            {form.debts.map((d, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1.4fr_1fr_0.8fr_0.9fr_auto]">
                <Input aria-label="Debt name" type="text" className="h-11" placeholder="Debt" value={d.name} onChange={(e) => setDebt(i, "name", e.target.value)} />
                <Input aria-label="Balance" type="number" min={0} step="any" inputMode="decimal" className="h-11" placeholder="Balance" value={d.balance} onChange={(e) => setDebt(i, "balance", e.target.value)} />
                <Input aria-label="Rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" placeholder="Rate" value={d.rate} onChange={(e) => setDebt(i, "rate", e.target.value)} />
                <Input aria-label="Minimum payment" type="number" min={0} step="any" inputMode="decimal" className="h-11" placeholder="Min" value={d.min} onChange={(e) => setDebt(i, "min", e.target.value)} />
                <button type="button" onClick={() => removeDebt(i)} className="col-span-2 h-9 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 sm:col-span-1 sm:h-11 sm:w-10" aria-label="Remove debt">×</button>
              </div>
            ))}
            <button type="button" onClick={addDebt} className="w-full rounded-xl border border-dashed border-zinc-300 py-2.5 text-sm font-semibold text-zinc-500 hover:border-orange-300 hover:text-orange-600">
              + Add another debt
            </button>

            <div className="pt-1">
              <Label htmlFor="extra">Extra monthly payment</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="extra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.extra} onChange={(e) => setForm((f) => ({ ...f, extra: e.target.value }))} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Debt free in</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatMonths(result.months) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest paid</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total paid</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPaid)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Payoff order</p>
              {result.perDebt.map((d) => (
                <p key={d.name} className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-600">{d.name}</span>
                  <span>{formatMonths(d.payoffMonth)}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different extra monthly payments change payoff time + interest. */}
      {result && <ExtraPaymentScenarios form={form} />}
    </div>
  );
}

/** Sweeps the extra monthly payment so the user sees how the payoff time and
 *  total interest change at $0 / $100 / $200 / $400 / $600 plus their own value. */
function ExtraPaymentScenarios({ form }: { form: FormState }) {
  const base = num(form.extra) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const extras = Array.from(new Set([0, 100, 200, 400, 600, base]))
      .filter((e) => e >= 0)
      .sort((a, b) => a - b);

    const built = extras.map((extra) => {
      const r = compute({ ...form, extra: String(extra) });
      return {
        extra,
        payoff: r ? formatMonths(r.months) : "—",
        interest: r?.totalInterest ?? 0,
        total: r?.totalPaid ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.extra === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "extra", label: "Extra / month", format: (v) => formatUSD(Number(v)) },
    { key: "payoff", label: "Debt free in", align: "right" },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "total", label: "Total paid", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you paid extra each month?"
      caption="Same debts — only the extra monthly payment changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="debt-snowball-extra-payment-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: SnowballResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = data[0].balance || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(months)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Total balance over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Debt snowball balance payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="snowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#snowFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
