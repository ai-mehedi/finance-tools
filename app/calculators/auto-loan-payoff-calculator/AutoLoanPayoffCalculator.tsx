"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeAutoLoanPayoff,
  formatUSD,
  formatUSD2,
  formatCompact,
  formatMonths,
  type AutoLoanPayoffResult,
} from "@/lib/calculators/auto-loan-payoff";

type FormState = {
  currentBalance: string;
  annualRatePct: string;
  monthlyPayment: string;
  extraMonthly: string;
};

const DEFAULTS: FormState = {
  currentBalance: "22000",
  annualRatePct: "7",
  monthlyPayment: "450",
  extraMonthly: "100",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AutoLoanPayoffResult | null {
  return computeAutoLoanPayoff({
    currentBalance: num(f.currentBalance) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    monthlyPayment: num(f.monthlyPayment) || 0,
    extraMonthly: num(f.extraMonthly) || 0,
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function AutoLoanPayoffCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a balance and payment greater than 0. Your monthly payment must be large enough to cover the interest, or the loan will never pay off."
      : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Loan details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <Money id="currentBalance" label="Current loan balance" value={form.currentBalance} onChange={(v) => set("currentBalance", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Interest rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <Money id="payment" label="Monthly payment" value={form.monthlyPayment} onChange={(v) => set("monthlyPayment", v)} />
            </div>
            <Money id="extra" label="Extra monthly payment (optional)" value={form.extraMonthly} onChange={(v) => set("extraMonthly", v)} />

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Time to payoff</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatMonths(result.withExtra.months) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Months to payoff</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{result.withExtra.months}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total interest</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.withExtra.totalInterest)}</span>
                </div>
                {result.hasExtra && (
                  <>
                    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                      <span className="text-sm font-medium text-zinc-500">Interest saved</span>
                      <span className="text-sm font-bold tabular-nums text-emerald-600">{formatUSD(result.interestSaved)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                      <span className="text-sm font-medium text-zinc-500">Time saved</span>
                      <span className="text-sm font-bold tabular-nums text-emerald-600">{formatMonths(result.monthsSaved)}</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && result.hasExtra && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Without the extra payment, payoff takes{" "}
              <span className="font-semibold text-zinc-600">{formatMonths(result.withoutExtra.months)}</span> and{" "}
              <span className="font-semibold text-zinc-600">{formatUSD2(result.withoutExtra.totalInterest)}</span> in interest.
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how different extra monthly payments change interest + payoff time. */}
      {result && <ExtraPaymentScenarios form={form} />}
    </div>
  );
}

/** Sweeps the extra monthly payment so the user sees the new payoff time and total
 *  interest at $0 / $50 / $100 / $200 / $300 plus their own value. */
function ExtraPaymentScenarios({ form }: { form: FormState }) {
  const base = num(form.extraMonthly) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const extras = Array.from(new Set([0, 50, 100, 200, 300, base]))
      .filter((e) => e >= 0)
      .sort((a, b) => a - b);

    const built = extras.map((extra) => {
      const r = compute({ ...form, extraMonthly: String(extra) });
      return {
        extra,
        payoff: r ? formatMonths(r.withExtra.months) : "—",
        interest: r?.withExtra.totalInterest ?? 0,
        saved: r?.interestSaved ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.extra === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "extra", label: "Extra / month", format: (v) => formatUSD(Number(v)) },
    { key: "payoff", label: "Paid off in", align: "right" },
    { key: "interest", label: "Total interest", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "saved", label: "Interest saved", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you paid extra each month?"
      caption="Same loan — only the extra monthly principal changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="auto-loan-payoff-extra-payment-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: AutoLoanPayoffResult }) {
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
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Auto loan payoff balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="payoffFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#payoffFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
