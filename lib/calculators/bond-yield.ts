// Pure logic for the Bond Yield Calculator.
// Computes current yield and yield to maturity (YTM) for a standard
// coupon bond, plus the total income an investor receives if held to maturity.

export interface BondYieldInput {
  faceValue: number; // par value, repaid at maturity
  couponRatePct: number; // annual coupon rate as a percent of face value
  price: number; // current market price paid for the bond
  yearsToMaturity: number;
  paymentsPerYear: number; // coupon payments per year (1, 2, 4, 12)
}

export interface BondYieldResult {
  annualCoupon: number; // total coupon income per year
  currentYieldPct: number; // annual coupon / price
  ytmPct: number; // yield to maturity, annualized
  totalCoupons: number; // all coupon payments over the life of the bond
  capitalGain: number; // face value minus price
  totalReturn: number; // total coupons + capital gain
}

// Price a bond given a per-period yield. Used to solve for YTM numerically.
function priceAtYield(
  faceValue: number,
  couponPerPeriod: number,
  periods: number,
  periodYield: number,
): number {
  if (periodYield === 0) return couponPerPeriod * periods + faceValue;
  const discount = Math.pow(1 + periodYield, periods);
  const couponPv = couponPerPeriod * ((1 - 1 / discount) / periodYield);
  const facePv = faceValue / discount;
  return couponPv + facePv;
}

export function computeBondYield(input: BondYieldInput): BondYieldResult | null {
  const { faceValue, couponRatePct, price, yearsToMaturity, paymentsPerYear } = input;

  if (!Number.isFinite(faceValue) || faceValue <= 0) return null;
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(yearsToMaturity) || yearsToMaturity <= 0) return null;
  if (!Number.isFinite(paymentsPerYear) || paymentsPerYear <= 0) return null;
  if (couponRatePct < 0) return null;

  const annualCoupon = faceValue * (couponRatePct / 100);
  const couponPerPeriod = annualCoupon / paymentsPerYear;
  const periods = Math.round(yearsToMaturity * paymentsPerYear);

  const currentYieldPct = (annualCoupon / price) * 100;

  // Solve for the per-period yield that prices the bond at its market price.
  // Bisection on a wide, monotonic range keeps this deterministic.
  let lo = -0.9 / paymentsPerYear; // allow modest negative yields
  let hi = 1.0; // 100% per period upper bound
  let mid = 0;
  for (let i = 0; i < 200; i++) {
    mid = (lo + hi) / 2;
    const guess = priceAtYield(faceValue, couponPerPeriod, periods, mid);
    if (guess > price) {
      lo = mid; // need a higher yield to lower the price
    } else {
      hi = mid;
    }
  }
  const ytmPct = mid * paymentsPerYear * 100;

  const totalCoupons = couponPerPeriod * periods;
  const capitalGain = faceValue - price;
  const totalReturn = totalCoupons + capitalGain;

  return {
    annualCoupon,
    currentYieldPct,
    ytmPct,
    totalCoupons,
    capitalGain,
    totalReturn,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;
