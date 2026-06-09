// Pure logic for the Bond Price Calculator.
// Prices a fixed-coupon bond as the present value of its coupon payments plus the
// present value of its face value, discounted at the required yield to maturity.
// Also builds a price-versus-yield curve so the rate sensitivity can be charted.

export type Frequency = "annual" | "semiannual" | "quarterly";

export const PERIODS_PER_YEAR: Record<Frequency, number> = {
  annual: 1,
  semiannual: 2,
  quarterly: 4,
};

export interface BondPriceInput {
  faceValue: number; // par value repaid at maturity
  couponRatePct: number; // annual coupon rate, percent of face
  yieldPct: number; // required annual yield to maturity, percent
  years: number; // years to maturity
  frequency: Frequency; // coupon payments per year
}

export interface BondYieldPoint {
  yieldPct: number;
  price: number;
}

export interface BondPriceResult {
  price: number; // clean present value of the bond
  couponPayment: number; // cash per coupon period
  totalCoupons: number; // sum of all coupon payments over the life
  pvCoupons: number; // present value of the coupon stream
  pvFace: number; // present value of the face value
  periods: number; // total number of payment periods
  premiumDiscount: number; // price - faceValue (positive = premium)
  status: "premium" | "discount" | "par";
  curve: BondYieldPoint[]; // price at a range of yields, for charting
}

function priceAt(
  faceValue: number,
  couponPayment: number,
  periodYield: number,
  periods: number,
): number {
  if (periodYield === 0) {
    return couponPayment * periods + faceValue;
  }
  const discount = Math.pow(1 + periodYield, periods);
  const pvCoupons = couponPayment * ((1 - 1 / discount) / periodYield);
  const pvFace = faceValue / discount;
  return pvCoupons + pvFace;
}

export function computeBondPrice(input: BondPriceInput): BondPriceResult | null {
  const { faceValue, couponRatePct, yieldPct, years, frequency } = input;

  if (!Number.isFinite(faceValue) || faceValue <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (couponRatePct < 0 || yieldPct < 0) return null;

  const m = PERIODS_PER_YEAR[frequency];
  const periods = Math.round(years * m);
  if (periods <= 0) return null;

  const couponPayment = (faceValue * (couponRatePct / 100)) / m;
  const periodYield = yieldPct / 100 / m;

  const price = priceAt(faceValue, couponPayment, periodYield, periods);

  // Present value split between the coupon stream and the redemption of par.
  let pvCoupons: number;
  let pvFace: number;
  if (periodYield === 0) {
    pvCoupons = couponPayment * periods;
    pvFace = faceValue;
  } else {
    const discount = Math.pow(1 + periodYield, periods);
    pvCoupons = couponPayment * ((1 - 1 / discount) / periodYield);
    pvFace = faceValue / discount;
  }

  const totalCoupons = couponPayment * periods;
  const premiumDiscount = price - faceValue;
  const status: BondPriceResult["status"] =
    Math.abs(premiumDiscount) < 0.005 ? "par" : premiumDiscount > 0 ? "premium" : "discount";

  // Build a price-yield curve centered on the entered yield.
  const center = yieldPct;
  const span = Math.max(4, center * 0.8); // at least a 4 point window each side
  const steps = 24;
  const lo = Math.max(0, center - span);
  const hi = center + span;
  const curve: BondYieldPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const yPct = lo + ((hi - lo) * i) / steps;
    const py = yPct / 100 / m;
    curve.push({ yieldPct: yPct, price: priceAt(faceValue, couponPayment, py, periods) });
  }

  return {
    price,
    couponPayment,
    totalCoupons,
    pvCoupons,
    pvFace,
    periods,
    premiumDiscount,
    status,
    curve,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD0 = (n: number) => usd0.format(Number.isFinite(n) ? n : 0);

/** Compact axis labels like $1.2k / $3.4M. */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
