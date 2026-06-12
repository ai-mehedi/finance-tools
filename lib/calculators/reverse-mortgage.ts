// Pure logic for the Reverse Mortgage Calculator.
// Estimates the principal limit a borrower can access from a Home Equity
// Conversion Mortgage (HECM) style reverse mortgage, then projects how a
// growing loan balance erodes home equity over time. Older borrowers and
// lower expected rates produce a higher principal limit factor (PLF).
//
// The available principal limit = appraised value (capped at the lending
// limit) times a principal limit factor that rises with age and falls with
// the expected interest rate. From that we subtract upfront mortgage
// insurance, financed closing costs and any existing mortgage payoff to get
// the net amount the borrower can actually receive.

export type Payout = "lumpSum" | "tenure" | "line";

export const PAYOUTS: { value: Payout; label: string }[] = [
  { value: "lumpSum", label: "Lump sum" },
  { value: "tenure", label: "Monthly (tenure)" },
  { value: "line", label: "Line of credit" },
];

// 2024-era HECM national lending limit. Value above this is not counted.
export const HECM_LIMIT = 1_149_825;

export interface ReverseMortgageInput {
  homeValue: number;
  age: number; // age of the youngest borrower
  expectedRatePct: number; // expected/index interest rate
  existingMortgage: number; // balance to be paid off at closing
  closingCosts: number; // origination + third-party fees, financed
  payout: Payout;
  projectionYears: number;
}

export interface ReverseMortgageYearPoint {
  year: number;
  loanBalance: number;
  homeValue: number;
  equity: number; // home value minus loan balance, floored at 0
}

export interface ReverseMortgageResult {
  cappedValue: number;
  principalLimitFactor: number; // 0..1
  principalLimit: number; // gross amount available
  upfrontMip: number; // 2% of capped value
  netAvailable: number; // after payoff, MIP and closing costs
  monthlyTenurePayment: number; // if taken as monthly tenure payments
  loanRatePct: number; // expected rate plus ongoing MIP
  schedule: ReverseMortgageYearPoint[];
}

// Approximate HECM principal limit factor as a function of age and the
// expected rate. Calibrated to the published tables: ~0.40 at age 62 / 5%
// rising with age, falling as the rate climbs. Clamped to a sane band.
function principalLimitFactor(age: number, expectedRatePct: number): number {
  const a = Math.min(Math.max(age, 62), 99);
  const ageComponent = 0.30 + (a - 62) * 0.011; // grows with age
  const rateComponent = Math.max(0, (expectedRatePct - 5) * 0.025); // penalty
  const plf = ageComponent - rateComponent;
  return Math.min(0.75, Math.max(0.15, plf));
}

export function computeReverseMortgage(
  input: ReverseMortgageInput
): ReverseMortgageResult | null {
  const {
    homeValue,
    age,
    expectedRatePct,
    existingMortgage,
    closingCosts,
    payout,
    projectionYears,
  } = input;

  if (!Number.isFinite(homeValue) || homeValue <= 0) return null;
  if (!Number.isFinite(age) || age < 62 || age > 99) return null;
  if (!Number.isFinite(expectedRatePct) || expectedRatePct < 0) return null;
  if (existingMortgage < 0 || closingCosts < 0) return null;
  if (!Number.isFinite(projectionYears) || projectionYears <= 0) return null;

  const cappedValue = Math.min(homeValue, HECM_LIMIT);
  const plf = principalLimitFactor(age, expectedRatePct);
  const principalLimit = cappedValue * plf;

  const upfrontMip = cappedValue * 0.02; // 2% initial mortgage insurance premium
  const netAvailable = Math.max(
    0,
    principalLimit - existingMortgage - closingCosts - upfrontMip
  );

  // The loan accrues at the expected rate plus an ongoing 0.5% annual MIP.
  const loanRatePct = expectedRatePct + 0.5;
  const annualRate = loanRatePct / 100;
  const monthlyRate = annualRate / 12;

  // Tenure payment: net principal limit spread over the borrower's expected
  // payout horizon (to age 100), as an annuity that grows with the loan rate.
  const tenureMonths = Math.max(12, Math.round((100 - age) * 12));
  const monthlyTenurePayment =
    monthlyRate > 0
      ? (netAvailable * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenureMonths))
      : netAvailable / tenureMonths;

  // Starting loan balance depends on how funds are drawn. Lump sum draws the
  // full net amount up front; tenure/line draw down gradually, so we model the
  // starting balance as the financed costs plus payoff (drawn at closing).
  const drawnAtClosing =
    payout === "lumpSum"
      ? netAvailable + existingMortgage + closingCosts + upfrontMip
      : existingMortgage + closingCosts + upfrontMip;

  // Home appreciation assumption for the equity projection.
  const homeAppreciation = 0.03;

  const schedule: ReverseMortgageYearPoint[] = [];
  let balance = drawnAtClosing;
  let value = homeValue;
  const monthlyDraw = payout === "lumpSum" ? 0 : monthlyTenurePayment;
  const yrs = Math.min(40, Math.round(projectionYears));

  schedule.push({
    year: 0,
    loanBalance: balance,
    homeValue: value,
    equity: Math.max(0, value - balance),
  });

  for (let y = 1; y <= yrs; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyDraw;
    }
    value = value * (1 + homeAppreciation);
    schedule.push({
      year: y,
      loanBalance: balance,
      homeValue: value,
      equity: Math.max(0, value - balance),
    });
  }

  return {
    cappedValue,
    principalLimitFactor: plf,
    principalLimit,
    upfrontMip,
    netAvailable,
    monthlyTenurePayment,
    loanRatePct,
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
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
