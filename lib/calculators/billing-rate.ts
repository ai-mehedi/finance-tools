// Pure logic for the Hourly Billing Rate Calculator.
// Works out the hourly rate a freelancer or consultant needs to charge to hit a
// target take-home income, after accounting for business costs, non-billable
// time and unpaid time off.

export interface BillingRateInput {
  targetIncome: number; // desired annual take-home (profit) you want
  businessCosts: number; // annual overhead: software, equipment, taxes set aside
  weeksOff: number; // unpaid weeks off per year (vacation, holidays, sick)
  hoursPerWeek: number; // hours you actually work per week
  billablePercent: number; // share of those hours that are billable, 0 to 100
}

export interface BillingRateResult {
  hourlyRate: number; // rate to charge per billable hour
  billableHours: number; // billable hours available per year
  workingWeeks: number; // weeks worked per year
  revenueNeeded: number; // income + costs
  dailyRate: number; // rate for an 8 hour day
  annualBillableValue: number; // hourlyRate times billableHours
}

export function computeBillingRate(input: BillingRateInput): BillingRateResult | null {
  const { targetIncome, businessCosts, weeksOff, hoursPerWeek, billablePercent } = input;

  if (!Number.isFinite(targetIncome) || targetIncome < 0) return null;
  if (!Number.isFinite(businessCosts) || businessCosts < 0) return null;
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) return null;
  if (!Number.isFinite(weeksOff) || weeksOff < 0 || weeksOff >= 52) return null;
  if (!Number.isFinite(billablePercent) || billablePercent <= 0 || billablePercent > 100) return null;

  const workingWeeks = 52 - weeksOff;
  const billableHours = workingWeeks * hoursPerWeek * (billablePercent / 100);
  if (billableHours <= 0) return null;

  const revenueNeeded = targetIncome + businessCosts;
  const hourlyRate = revenueNeeded / billableHours;
  const dailyRate = hourlyRate * 8;
  const annualBillableValue = hourlyRate * billableHours;

  return {
    hourlyRate,
    billableHours,
    workingWeeks,
    revenueNeeded,
    dailyRate,
    annualBillableValue,
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
