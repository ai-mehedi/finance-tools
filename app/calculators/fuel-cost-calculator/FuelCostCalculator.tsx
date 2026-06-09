"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeFuelCost,
  formatUSD,
  formatUSD0,
  type FuelCostResult,
} from "@/lib/calculators/fuel-cost";

type FormState = {
  distance: string;
  roundTrip: "one" | "round";
  mpg: string;
  pricePerGallon: string;
  tripsPerWeek: string;
};

const DEFAULTS: FormState = {
  distance: "30",
  roundTrip: "round",
  mpg: "28",
  pricePerGallon: "3.45",
  tripsPerWeek: "5",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): FuelCostResult | null {
  return computeFuelCost({
    distance: num(f.distance),
    roundTrip: f.roundTrip === "round",
    mpg: num(f.mpg),
    pricePerGallon: num(f.pricePerGallon) || 0,
    tripsPerWeek: num(f.tripsPerWeek) || 0,
  });
}

export default function FuelCostCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<FuelCostResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a distance and fuel economy greater than 0.");
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
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-base font-extrabold text-zinc-900">Trip details</h2>
        <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input id="distance" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.distance} onChange={(e) => set("distance", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="trip">Trip type</Label>
              <Select id="trip" className="h-11" value={form.roundTrip} onChange={(e) => set("roundTrip", e.target.value as FormState["roundTrip"])}>
                <option value="one">One way</option>
                <option value="round">Round trip</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mpg">Fuel economy (MPG)</Label>
              <Input id="mpg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.mpg} onChange={(e) => set("mpg", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="price">Fuel price ($ / gallon)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.pricePerGallon} onChange={(e) => set("pricePerGallon", e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="trips">Trips per week (for yearly cost)</Label>
            <Input id="trips" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.tripsPerWeek} onChange={(e) => set("tripsPerWeek", e.target.value)} />
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
        <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Cost per trip</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
          {result ? formatUSD(result.costPerTrip) : "—"}
        </p>
        <div className="mt-5 space-y-2">
          {result ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Fuel used per trip</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{result.gallonsPerTrip.toFixed(2)} gal</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Cost per mile</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.costPerMile)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-500">Yearly cost</span>
                <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD0(result.annualCost)}</span>
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
          )}
        </div>
      </div>
    </form>
  );
}
