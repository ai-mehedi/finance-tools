// Pure logic for the Lease vs Buy Calculator (vehicle).
// Compares the net cost of leasing a car over a term against buying it with a
// loan and keeping it, accounting for the resale value you still own at the end.

export interface LeaseVsBuyInput {
  // Shared
  termYears: number;

  // Lease
  leaseDownPayment: number;
  leaseMonthlyPayment: number;

  // Buy
  vehiclePrice: number;
  buyDownPayment: number;
  loanRatePct: number;
  loanTermYears: number;
  resaleValue: number; // estimated value at end of the comparison term
}

export interface LeaseVsBuyResult {
  leaseTotalCost: number;
  buyTotalPaid: number; // down payment + all loan payments made within the term
  buyNetCost: number; // total paid minus what the car is still worth
  loanMonthlyPayment: number;
  monthsCompared: number;
  cheaper: "lease" | "buy" | "equal";
  difference: number; // absolute saving of the cheaper option
}

export function computeLeaseVsBuy(input: LeaseVsBuyInput): LeaseVsBuyResult | null {
  const {
    termYears,
    leaseDownPayment,
    leaseMonthlyPayment,
    vehiclePrice,
    buyDownPayment,
    loanRatePct,
    loanTermYears,
    resaleValue,
  } = input;

  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (vehiclePrice < 0 || leaseMonthlyPayment < 0 || resaleValue < 0) return null;
  if (loanRatePct < 0 || loanTermYears <= 0) return null;

  const monthsCompared = Math.round(termYears * 12);

  // Lease: down payment plus every monthly payment during the comparison term.
  const leaseTotalCost = leaseDownPayment + leaseMonthlyPayment * monthsCompared;

  // Buy: amortizing loan on the financed amount.
  const loanAmount = Math.max(0, vehiclePrice - buyDownPayment);
  const r = loanRatePct / 100 / 12;
  const nLoan = Math.round(loanTermYears * 12);
  const loanMonthlyPayment =
    loanAmount === 0
      ? 0
      : r > 0
        ? (loanAmount * r * Math.pow(1 + r, nLoan)) / (Math.pow(1 + r, nLoan) - 1)
        : loanAmount / nLoan;

  // Only count payments actually made inside the comparison window.
  const paymentsMade = Math.min(monthsCompared, nLoan);
  const buyTotalPaid = buyDownPayment + loanMonthlyPayment * paymentsMade;

  // Net cost subtracts the resale value of the car you still own.
  const buyNetCost = buyTotalPaid - resaleValue;

  let cheaper: "lease" | "buy" | "equal";
  if (Math.abs(leaseTotalCost - buyNetCost) < 0.005) cheaper = "equal";
  else cheaper = buyNetCost < leaseTotalCost ? "buy" : "lease";

  const difference = Math.abs(leaseTotalCost - buyNetCost);

  return {
    leaseTotalCost,
    buyTotalPaid,
    buyNetCost,
    loanMonthlyPayment,
    monthsCompared,
    cheaper,
    difference,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
