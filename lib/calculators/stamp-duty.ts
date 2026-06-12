// Pure logic for the Stamp Duty Calculator (India).
// Stamp duty and registration charges on a property purchase are levied as a
// percentage of the higher of the agreement value or the government-set ready
// reckoner / circle rate value. Rates vary by state and, in several states, by
// buyer gender. This tool computes duty, registration charge and the total
// acquisition cost, plus a small breakdown for charting.

export type Gender = "male" | "female" | "joint";

export interface StampDutyInput {
  propertyValue: number; // agreement value of the property
  marketValue: number; // government / circle rate value (0 = same as agreement)
  stampDutyPct: number; // stamp duty rate for this state and buyer
  registrationPct: number; // registration charge rate
  registrationCap: number; // optional cap on the registration charge (0 = no cap)
}

export interface StampDutyResult {
  chargeableValue: number; // higher of agreement and market value
  stampDuty: number;
  registrationCharge: number;
  totalCharges: number; // stamp duty plus registration
  totalCost: number; // property value plus all charges
  effectivePct: number; // total charges as a percent of property value
}

export function computeStampDuty(input: StampDutyInput): StampDutyResult | null {
  const { propertyValue, marketValue, stampDutyPct, registrationPct, registrationCap } = input;

  if (!Number.isFinite(propertyValue) || propertyValue <= 0) return null;
  if (!Number.isFinite(marketValue) || marketValue < 0) return null;
  if (!Number.isFinite(stampDutyPct) || stampDutyPct < 0) return null;
  if (!Number.isFinite(registrationPct) || registrationPct < 0) return null;
  if (!Number.isFinite(registrationCap) || registrationCap < 0) return null;

  // Duty is charged on the higher of agreement value and circle/market value.
  const chargeableValue = Math.max(propertyValue, marketValue);

  const stampDuty = chargeableValue * (stampDutyPct / 100);
  let registrationCharge = chargeableValue * (registrationPct / 100);
  if (registrationCap > 0) {
    registrationCharge = Math.min(registrationCharge, registrationCap);
  }

  const totalCharges = stampDuty + registrationCharge;
  const totalCost = propertyValue + totalCharges;
  const effectivePct = (totalCharges / propertyValue) * 100;

  return {
    chargeableValue,
    stampDuty,
    registrationCharge,
    totalCharges,
    totalCost,
    effectivePct,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINR = (n: number) => inr.format(Number.isFinite(n) ? n : 0);
// Alias kept generic so the component can import a single money formatter.
export const formatUSD = formatINR;

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
