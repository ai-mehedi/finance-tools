"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeBalanceTransfer,
  formatUSD,
  formatCompact,
  type BalanceTransferResult,
} from "@/lib/calculators/balance-transfer";

type FormState = {
  balance: string;
  currentAprPct: string;
  monthlyPayment: string;
  transferFeePct: string;
  introAprPct: string;
  introMonths: string;
  postIntroAprPct: string;
};

const DEFAULTS: FormState = {
  balance: "6000",
  currentAprPct: "22",
  monthlyPayment: "300",
  transferFeePct: "3",
  introAprPct: "0",
  introMonths: "18",
  postIntroAprPct: "19",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BalanceTransferResult | null {
  return computeBalanceTransfer({
    balance: num(f.balance) || 0,
    currentAprPct: num(f.currentAprPct) || 0,
    monthlyPayment: num(f.monthlyPayment) || 0,
    transferFeePct: num(f.transferFeePct) || 0,
    introAprPct: num(f.introAprPct) || 0,
    introMonths: num(f.introMonths) || 0,
    postIntroAprPct: num(f.postIntroAprPct) || 0,
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

function Pct({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function BalanceTransferCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<BalanceTransferResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a balance and monthly payment greater than 0.");
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

  const saves = result ? result.savings > 0 : false;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your card and offer</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Money id="balance" label="Current balance" value={form.balance} onChange={(v) => set("balance", v)} />
              <Money id="payment" label="Monthly payment" value={form.monthlyPayment} onChange={(v) => set("monthlyPayment", v)} />
            </div>
            <Pct id="curApr" label="Current card APR (%)" value={form.currentAprPct} onChange={(v) => set("currentAprPct", v)} />

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <p className="mb-3 text-sm font-semibold text-zinc-600">Balance transfer offer</p>
              <div className="grid grid-cols-2 gap-3">
                <Pct id="fee" label="Transfer fee (%)" value={form.transferFeePct} onChange={(v) => set("transferFeePct", v)} />
                <Pct id="introApr" label="Intro APR (%)" value={form.introAprPct} onChange={(v) => set("introAprPct", v)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="introMonths">Intro period (months)</Label>
                  <Input id="introMonths" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.introMonths} onChange={(e) => set("introMonths", e.target.value)} />
                </div>
                <Pct id="postApr" label="APR after intro (%)" value={form.postIntroAprPct} onChange={(v) => set("postIntroAprPct", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">{saves ? "You could save" : "Extra cost"}</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(Math.abs(result.savings)) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Stay: interest paid</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.currentInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Transfer: interest + fee</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.transferInterest)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Transfer fee</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.transferFee)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Payoff: <span className="font-semibold text-zinc-600">{result.currentMonths} mo</span> staying vs{" "}
              <span className="font-semibold text-zinc-600">{result.transferMonths} mo</span> transferring.
              {result.paymentTooLow && " Your payment barely covers interest on the current card, so it would take a very long time to clear."}
            </p>
          )}
        </div>
      </form>

      {result && result.schedule.length > 1 && <PayoffChart result={result} />}
    </div>
  );
}

function PayoffChart({ result }: { result: BalanceTransferResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const months = data[data.length - 1].month || 1;
  const maxVal = Math.max(...data.map((p) => Math.max(p.current, p.transfer))) || 1;

  const x = (m: number) => pad.l + (m / months) * innerW;
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const curPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.current).toFixed(1)}`);
  const trfPts = data.map((p) => `${x(p.month).toFixed(1)},${y(p.transfer).toFixed(1)}`);
  const curLine = `M${curPts.join(" L")}`;
  const trfLine = `M${trfPts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = (maxVal / 4) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(months / 2), months].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Balance over time</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Stay</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Transfer</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Balance transfer payoff comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <path d={curLine} fill="none" stroke="#a1a1aa" strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />
        <path d={trfLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} mo</text>
        ))}
      </svg>
    </div>
  );
}
