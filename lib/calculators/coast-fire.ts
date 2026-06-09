// Pure logic for the Coast FIRE Calculator.
// Coast FIRE is the point where your current invested savings, left to grow
// with no further contributions, will reach your retirement target by the time
// you retire. We grow the current balance at the real (inflation adjusted) rate
// of return and compare it against the number you need at retirement.
//
//   FIRE number = annual spending / safe withdrawal rate
//   Future value of current savings = current x (1 + realRate)^yearsToRetire
//   Coast FIRE number = FIRE number / (1 + realRate)^yearsToRetire
// You have hit Coast FIRE once your current savings >= the Coast FIRE number.

export interface CoastFireInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualSpending: number; // desired annual spending in retirement (today's dollars)
  returnRatePct: number; // expected nominal annual return
  inflationRatePct: number; // expected annual inflation
  withdrawalRatePct: number; // safe withdrawal rate, e.g. 4
}

export interface CoastFireYearPoint {
  year: number; // years from now
  age: number;
  balance: number; // projected balance of current savings, no new contributions
}

export interface CoastFireResult {
  yearsToRetirement: number;
  realRatePct: number; // real return used, as a percent
  fireNumber: number; // amount needed at retirement
  coastNumber: number; // amount needed today to coast to the fire number
  projectedAtRetirement: number; // current savings grown to retirement
  surplus: number; // projectedAtRetirement minus fireNumber
  hasReachedCoast: boolean;
  schedule: CoastFireYearPoint[];
}

export function computeCoastFire(input: CoastFireInput): CoastFireResult | null {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    annualSpending,
    returnRatePct,
    inflationRatePct,
    withdrawalRatePct,
  } = input;

  if (!Number.isFinite(currentAge) || currentAge < 0) return null;
  if (!Number.isFinite(retirementAge) || retirementAge <= currentAge) return null;
  if (!Number.isFinite(currentSavings) || currentSavings < 0) return null;
  if (!Number.isFinite(annualSpending) || annualSpending <= 0) return null;
  if (!Number.isFinite(withdrawalRatePct) || withdrawalRatePct <= 0) return null;
  if (returnRatePct < 0 || inflationRatePct < 0) return null;

  const yearsToRetirement = retirementAge - currentAge;

  // Real rate so that the FIRE number can stay in today's dollars.
  const nominal = returnRatePct / 100;
  const inflation = inflationRatePct / 100;
  const realRate = (1 + nominal) / (1 + inflation) - 1;

  const fireNumber = annualSpending / (withdrawalRatePct / 100);
  const growth = Math.pow(1 + realRate, yearsToRetirement);
  const coastNumber = fireNumber / growth;
  const projectedAtRetirement = currentSavings * growth;
  const surplus = projectedAtRetirement - fireNumber;
  const hasReachedCoast = currentSavings >= coastNumber;

  const schedule: CoastFireYearPoint[] = [];
  for (let y = 0; y <= yearsToRetirement; y++) {
    schedule.push({
      year: y,
      age: currentAge + y,
      balance: currentSavings * Math.pow(1 + realRate, y),
    });
  }

  return {
    yearsToRetirement,
    realRatePct: realRate * 100,
    fireNumber,
    coastNumber,
    projectedAtRetirement,
    surplus,
    hasReachedCoast,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
