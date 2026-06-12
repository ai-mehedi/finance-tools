"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeGasCost,
  formatUSD,
  formatCostPerMile,
  type GasCostResult,
} from "@/lib/calculators/gas-cost";

const TRIP_MODES: { value: "oneway" | "round"; label: string }[] = [
  { value: "oneway", label: "One way" },
  { value: "round", label: "Round trip" },
];

type FormState = {
  distance: string;
  mpg: string;
  price: string;
  trip: "oneway" | "round";
};

const DEFAULTS: FormState = {
  distance: "300",
  mpg: "28",
  price: "3.50",
  trip: "oneway",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): GasCostResult | null {
  return computeGasCost({
    distance: num(f.distance),
    mpg: num(f.mpg),
    price: num(f.price) || 0,
    roundTrip: f.trip === "round",
  });
}

export default function GasCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<GasCostResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a trip distance above 0, a fuel economy above 0, and a gas price of 0 or more.");
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
        { label: "Distance (mi)", value: result.effectiveDistance.toLocaleString("en-US", { maximumFractionDigits: 1 }), color: "bg-zinc-300" },
        { label: "Gallons used", value: result.gallons.toLocaleString("en-US", { maximumFractionDigits: 2 }), color: "bg-orange-300" },
        { label: "Cost per mile", value: formatCostPerMile(result.costPerMile), color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trip details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your trip and vehicle details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="distance">Trip distance (mi)</Label>
                <Input id="distance" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.distance} onChange={(e) => set("distance", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="trip">Trip type</Label>
                <Select id="trip" className="h-11" value={form.trip} onChange={(e) => set("trip", e.target.value as "oneway" | "round")}>
                  {TRIP_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mpg">Fuel economy (MPG)</Label>
                <Input id="mpg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.mpg} onChange={(e) => set("mpg", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="price">Gas price (per gallon)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.price} onChange={(e) => set("price", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total fuel cost</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalCost) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              {result.gallons.toLocaleString("en-US", { maximumFractionDigits: 2 })} gal · {formatCostPerMile(result.costPerMile)} / mile
            </p>
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
    </div>
  );
}
