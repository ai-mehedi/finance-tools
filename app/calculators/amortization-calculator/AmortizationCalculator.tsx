"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import AmortizationTable from "../../components/calc/AmortizationTable";
import {
  computeAmortization,
  formatUSD,
  formatUSD2,
  formatCompact,
  type AmortizationResult,
} from "@/lib/calculators/amortization";

type FormState = {
  loanAmount: string;
  annualRatePct: string;
  termYears: string;
};

const DEFAULTS: FormState = {
  loanAmount: "250000",
  annualRatePct: "6.5",
  termYears: "30",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AmortizationResult | null {
  return computeAmortization({
    loanAmount: num(f.loanAmount) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
  });
}

export default function AmortizationCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a loan amount and term greater than 0." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const visibleRows = result ? (showAll ? result.rows : result.rows.slice(0, 12)) : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Loan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="loan">Loan amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="loan" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => set("loanAmount", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Loan term (years)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Monthly payment</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.monthlyPayment) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total paid</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Payments</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.numberOfPayments}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {result && result.rows.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Payment schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm tabular-nums">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="py-2 pr-3 text-left font-semibold">#</th>
                  <th className="py-2 pr-3 font-semibold">Payment</th>
                  <th className="py-2 pr-3 font-semibold">Principal</th>
                  <th className="py-2 pr-3 font-semibold">Interest</th>
                  <th className="py-2 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.period} className="border-b border-zinc-50">
                    <td className="py-2 pr-3 text-left font-medium text-zinc-500">{row.period}</td>
                    <td className="py-2 pr-3 text-zinc-700">{formatUSD2(row.payment)}</td>
                    <td className="py-2 pr-3 text-zinc-700">{formatUSD2(row.principal)}</td>
                    <td className="py-2 pr-3 text-zinc-700">{formatUSD2(row.interest)}</td>
                    <td className="py-2 font-semibold text-zinc-900">{formatUSD2(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length > 12 && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
            >
              {showAll ? "Show first year only" : `Show all ${result.rows.length} payments`}
            </button>
          )}
        </div>
      )}

      {/* What-if: how different interest rates change monthly payment + lifetime interest. */}
      {result && <RateScenarios form={form} />}

      {/* Full month-by-month amortization schedule grouped by year, with CSV export. */}
      {result && (
        <AmortizationTable
          rows={result.rows.map((r) => ({
            month: r.period,
            payment: r.payment,
            principal: r.principal,
            interest: r.interest,
            balance: r.balance,
          }))}
          format={formatUSD}
          csvName="amortization-calculator"
        />
      )}
    </div>
  );
}

/** Sweeps the annual interest rate so the user sees how the monthly payment and
 *  lifetime interest move at several rates, plus their own value. */
function RateScenarios({ form }: { form: FormState }) {
  const base = num(form.annualRatePct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([3, 4, 5, 6, 7, 8, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, annualRatePct: String(rate) });
      return {
        rate,
        monthly: r?.monthlyPayment ?? 0,
        interest: r?.totalInterest ?? 0,
        totalPaid: r?.totalPaid ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Interest rate", format: (v) => `${Number(v)}%` },
    { key: "monthly", label: "Monthly payment", align: "right", format: (v) => formatUSD2(Number(v)) },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "totalPaid", label: "Total paid", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the interest rate were different?"
      caption="Same loan amount and term — only the annual rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="amortization-rate-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: AmortizationResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const maxVal = data[0].balance || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const pts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`);
  const areaPath = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(years)},${y(0)} Z`;
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Remaining balance over time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Loan balance payoff chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="amortFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#amortFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
