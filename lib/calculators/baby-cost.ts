// Pure logic for the Baby Cost Calculator.
// Estimates first-year baby costs by summing one-time setup items and
// recurring monthly costs over twelve months.

export interface BabyCostInput {
  oneTimeGear: number; // crib, stroller, car seat, furniture, one-time setup
  monthlyDiapers: number;
  monthlyFood: number; // formula and food
  monthlyChildcare: number;
  monthlyHealthcare: number; // insurance, copays, medicine
  monthlyClothing: number;
  monthlyOther: number; // toys, books, misc
}

export interface BabyCostLine {
  label: string;
  monthly: number;
  yearly: number;
}

export interface BabyCostResult {
  oneTime: number;
  monthlyRecurring: number;
  yearlyRecurring: number;
  firstYearTotal: number;
  lines: BabyCostLine[];
}

const nz = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeBabyCost(input: BabyCostInput): BabyCostResult | null {
  const oneTime = nz(input.oneTimeGear);
  const diapers = nz(input.monthlyDiapers);
  const food = nz(input.monthlyFood);
  const childcare = nz(input.monthlyChildcare);
  const healthcare = nz(input.monthlyHealthcare);
  const clothing = nz(input.monthlyClothing);
  const other = nz(input.monthlyOther);

  const monthlyRecurring = diapers + food + childcare + healthcare + clothing + other;
  if (oneTime <= 0 && monthlyRecurring <= 0) return null;

  const yearlyRecurring = monthlyRecurring * 12;
  const firstYearTotal = oneTime + yearlyRecurring;

  const lines: BabyCostLine[] = [
    { label: "Diapers and wipes", monthly: diapers, yearly: diapers * 12 },
    { label: "Food and formula", monthly: food, yearly: food * 12 },
    { label: "Childcare", monthly: childcare, yearly: childcare * 12 },
    { label: "Healthcare", monthly: healthcare, yearly: healthcare * 12 },
    { label: "Clothing", monthly: clothing, yearly: clothing * 12 },
    { label: "Other", monthly: other, yearly: other * 12 },
  ].filter((l) => l.yearly > 0);

  return { oneTime, monthlyRecurring, yearlyRecurring, firstYearTotal, lines };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
