"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeBalloonLoan,
  formatUSD,
  formatUSD2,
  formatCompact,
  type BalloonLoanResult,
} from "@/lib/calculators/balloon-loan";

type FormState = {
  loanAmount: string;
  annualRatePct: string;
  amortYears: string;
  balloonYears: string;
};

const DEFAULTS: FormState = {
  loanAmount: "250000",
  annualRatePct: "6.5",
  amortYears: "30",
  balloonYears: "7",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BalloonLoanResult | null {
  return computeBalloonLoan({
    loanAmount: num(f.loanAmount) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    amortYears: num(f.amortYears),
    balloonYears: num(f.balloonYears),
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

export default function BalloonLoanCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error =
    result === null
      ? "Enter a loan amount, and a balloon term no longer than the amortization term."
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
            <Money id="loanAmount" label="Loan amount" value={form.loanAmount} onChange={(v) => set("loanAmount", v)} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="amort">Amortized over (yr)</Label>
                <Input id="amort" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.amortYears} onChange={(e) => set("amortYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="balloon">Balloon due (yr)</Label>
                <Input id="balloon" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.balloonYears} onChange={(e) => set("balloonYears", e.target.value)} />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-500">
              The payment is based on the longer amortization schedule, but the loan comes due after
              the shorter balloon term, leaving a lump sum to pay or refinance.
            </p>

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
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Balloon payment due
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.balloonPayment)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
                    Interest before balloon
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                    Total cost
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalCost)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <BalanceChart result={result} />}

      {/* What-if: how the balloon due date changes the lump sum and interest paid. */}
      {result && <BalloonTermScenarios form={form} />}
    </div>
  );
}

/** Sweeps the balloon due year so the user sees how the lump-sum balloon payment
 *  and interest paid before it shrink the longer the loan runs. */
function BalloonTermScenarios({ form }: { form: FormState }) {
  const amort = num(form.amortYears);
  const base = num(form.balloonYears);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [3, 5, 7, 10, 15, base].filter(
      (b) => Number.isFinite(b) && b > 0 && (!Number.isFinite(amort) || b <= amort)
    );
    const years = Array.from(new Set(candidates)).sort((a, b) => a - b);

    const built = years.map((balloonYears) => {
      const r = compute({ ...form, balloonYears: String(balloonYears) });
      return {
        balloonYears,
        balloon: r?.balloonPayment ?? 0,
        interest: r?.totalInterest ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.balloonYears === base) };
  }, [form, base, amort]);

  const columns: GridColumn[] = [
    { key: "balloonYears", label: "Balloon due (yr)", format: (v) => `${v} yr` },
    { key: "balloon", label: "Balloon payment", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "interest", label: "Interest before balloon", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the balloon came due sooner or later?"
      caption="Same loan amount, rate and amortization — only the balloon due date changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="balloon-loan-term-scenarios"
    />
  );
}

function BalanceChart({ result }: { result: BalloonLoanResult }) {
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
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Balance until the balloon comes due</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Balloon loan balance chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="balloonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#balloonFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
