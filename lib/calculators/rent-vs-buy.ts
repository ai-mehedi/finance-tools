// Pure logic for the Rent vs Buy Calculator.
// Simulates renting versus buying over a holding period month by month and
// compares the total cost of each path. Buying accounts for the down payment,
// mortgage payments, property tax, insurance, maintenance, home appreciation and
// the sale proceeds (net of selling costs and remaining loan) at the end. Renting
// accounts for rent that grows each year plus the opportunity cost of investing
// the money a buyer would have tied up. Exposes a per-year net-cost schedule for
// charting (cumulative cost of each path, lower is better).

export interface RentVsBuyInput {
  homePrice: number;
  downPaymentPct: number; // percent of home price
  mortgageRatePct: number; // annual nominal rate
  loanTermYears: number; // amortization term
  monthlyRent: number; // starting monthly rent
  rentGrowthPct: number; // annual rent increase
  homeAppreciationPct: number; // annual home value growth
  propertyTaxPct: number; // annual, as percent of home value
  maintenancePct: number; // annual, as percent of home value
  insuranceMonthly: number; // homeowner/renter insurance per month
  investmentReturnPct: number; // annual return on money a renter invests
  sellingCostPct: number; // cost to sell, as percent of sale price
  stayYears: number; // holding period
}

export interface RentVsBuyYearPoint {
  year: number;
  buyCost: number; // cumulative net cost of buying
  rentCost: number; // cumulative net cost of renting
}

export interface RentVsBuyResult {
  totalBuyCost: number; // net cost of buying over the period
  totalRentCost: number; // net cost of renting over the period
  difference: number; // rent cost minus buy cost; positive means buying is cheaper
  cheaper: "buy" | "rent" | "even";
  monthlyMortgage: number;
  schedule: RentVsBuyYearPoint[];
}

function monthlyPayment(principal: number, annualRatePct: number, termYears: number): number {
  const r = annualRatePct / 100 / 12;
  const n = Math.round(termYears * 12);
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function computeRentVsBuy(input: RentVsBuyInput): RentVsBuyResult | null {
  const {
    homePrice,
    downPaymentPct,
    mortgageRatePct,
    loanTermYears,
    monthlyRent,
    rentGrowthPct,
    homeAppreciationPct,
    propertyTaxPct,
    maintenancePct,
    insuranceMonthly,
    investmentReturnPct,
    sellingCostPct,
    stayYears,
  } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return null;
  if (!Number.isFinite(monthlyRent) || monthlyRent < 0) return null;
  if (!Number.isFinite(stayYears) || stayYears < 1) return null;
  if (downPaymentPct < 0 || downPaymentPct > 100) return null;

  const months = Math.round(stayYears * 12);
  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const mRate = mortgageRatePct / 100 / 12;
  const pay = monthlyPayment(loanAmount, mortgageRatePct, loanTermYears);

  const appMonthly = Math.pow(1 + homeAppreciationPct / 100, 1 / 12) - 1;
  const investMonthly = Math.pow(1 + investmentReturnPct / 100, 1 / 12) - 1;
  const rentGrowthMonthly = Math.pow(1 + rentGrowthPct / 100, 1 / 12) - 1;

  let loanBalance = loanAmount;
  let homeValue = homePrice;
  let rent = monthlyRent;

  // Buyer's out-of-pocket starts with the down payment.
  let buyOutOfPocket = downPayment;
  let rentPaid = 0;
  // Renter invests the down payment plus, each month, the difference if owning costs more.
  let renterPortfolio = downPayment;

  const schedule: RentVsBuyYearPoint[] = [{ year: 0, buyCost: downPayment, rentCost: 0 }];

  for (let m = 1; m <= months; m++) {
    homeValue *= 1 + appMonthly;

    const interest = loanBalance * mRate;
    const principalPaid = Math.min(Math.max(pay - interest, 0), loanBalance);
    loanBalance -= principalPaid;

    const tax = (homeValue * (propertyTaxPct / 100)) / 12;
    const maint = (homeValue * (maintenancePct / 100)) / 12;
    const ownMonthly = pay + tax + maint + insuranceMonthly;
    buyOutOfPocket += ownMonthly;

    rentPaid += rent;

    // Renter invests the gap between owning and renting (if owning is pricier).
    const gap = ownMonthly - rent;
    renterPortfolio *= 1 + investMonthly;
    if (gap > 0) renterPortfolio += gap;

    if (rentGrowthMonthly !== 0 && m % 12 === 0) {
      rent *= 1 + rentGrowthPct / 100;
    }

    if (m % 12 === 0) {
      const sellProceeds = homeValue * (1 - sellingCostPct / 100) - loanBalance;
      const buyCostNow = buyOutOfPocket - sellProceeds;
      const rentCostNow = rentPaid - (renterPortfolio - 0);
      schedule.push({ year: m / 12, buyCost: buyCostNow, rentCost: rentCostNow });
    }
  }

  const sellProceeds = homeValue * (1 - sellingCostPct / 100) - loanBalance;
  const totalBuyCost = buyOutOfPocket - sellProceeds;
  // Renter's net cost is rent paid minus the value their invested money grew to.
  const totalRentCost = rentPaid - renterPortfolio;

  const difference = totalRentCost - totalBuyCost;
  const cheaper: "buy" | "rent" | "even" =
    Math.abs(difference) < 1 ? "even" : difference > 0 ? "buy" : "rent";

  return {
    totalBuyCost,
    totalRentCost,
    difference,
    cheaper,
    monthlyMortgage: pay,
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
