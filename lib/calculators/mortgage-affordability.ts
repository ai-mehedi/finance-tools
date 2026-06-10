// Pure logic for the Mortgage Affordability Calculator.
// Works out the largest home price you can responsibly buy from your income,
// existing debts, down payment, rate and term, using the classic front-end and
// back-end debt-to-income (DTI) limits that lenders apply.
//
// Method: the maximum monthly mortgage payment is the smaller of
//   - front-end limit:  income * frontDTI
//   - back-end limit:   income * backDTI  minus existing debts
// That payment must also cover property tax, home insurance and any HOA dues,
// so those recurring costs are subtracted before solving for principal &
// interest. The affordable loan is then the present value of that P&I payment,
// and the affordable home price adds back the down payment.

export interface AffordabilityInput {
  annualIncome: number; // gross, per year
  monthlyDebts: number; // car loans, student loans, credit cards, etc.
  downPayment: number; // cash you will put down
  annualRatePct: number; // mortgage interest rate
  termYears: number; // loan length
  frontDtiPct: number; // housing-cost ceiling as % of gross income
  backDtiPct: number; // total-debt ceiling as % of gross income
  annualTaxPct: number; // property tax as % of home price per year
  annualInsurance: number; // homeowners insurance, per year (flat)
  monthlyHoa: number; // HOA / condo dues, per month
}

export interface AffordabilityBar {
  label: string;
  value: number;
}

export interface AffordabilityResult {
  homePrice: number; // maximum affordable purchase price
  loanAmount: number; // affordable mortgage principal
  maxMonthlyHousing: number; // ceiling for the full housing payment (PITI + HOA)
  principalInterest: number; // the P&I portion of the monthly payment
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  totalMonthly: number; // full housing payment at the affordable price
  bindingLimit: "front-end" | "back-end"; // which DTI rule capped you
  bars: AffordabilityBar[]; // monthly payment composition for charting
}

export function computeAffordability(input: AffordabilityInput): AffordabilityResult | null {
  const {
    annualIncome,
    monthlyDebts,
    downPayment,
    annualRatePct,
    termYears,
    frontDtiPct,
    backDtiPct,
    annualTaxPct,
    annualInsurance,
    monthlyHoa,
  } = input;

  if (!Number.isFinite(annualIncome) || annualIncome <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (monthlyDebts < 0 || downPayment < 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (frontDtiPct <= 0 || backDtiPct <= 0) return null;

  const monthlyIncome = annualIncome / 12;

  // Maximum total housing payment allowed by each DTI rule.
  const frontCeiling = monthlyIncome * (frontDtiPct / 100);
  const backCeiling = monthlyIncome * (backDtiPct / 100) - monthlyDebts;

  const maxMonthlyHousing = Math.max(0, Math.min(frontCeiling, backCeiling));
  const bindingLimit: "front-end" | "back-end" =
    backCeiling < frontCeiling ? "back-end" : "front-end";

  // Recurring non-P&I costs. Tax scales with the home price, so we treat it as a
  // rate that eats into how much price the payment can support.
  const monthlyInsurance = annualInsurance / 12;
  const taxRateMonthly = annualTaxPct / 100 / 12; // fraction of home price per month

  // Budget left for principal & interest after flat costs (insurance + HOA).
  const budgetForPiAndTax = maxMonthlyHousing - monthlyInsurance - monthlyHoa;
  if (budgetForPiAndTax <= 0) {
    return {
      homePrice: downPayment,
      loanAmount: 0,
      maxMonthlyHousing,
      principalInterest: 0,
      monthlyTax: 0,
      monthlyInsurance,
      monthlyHoa,
      totalMonthly: monthlyInsurance + monthlyHoa,
      bindingLimit,
      bars: [
        { label: "Principal & interest", value: 0 },
        { label: "Property tax", value: 0 },
        { label: "Insurance", value: monthlyInsurance },
        { label: "HOA", value: monthlyHoa },
      ],
    };
  }

  const i = annualRatePct / 100 / 12; // monthly rate
  const n = Math.round(termYears * 12);

  // Mortgage payment factor: payment per $1 of loan.
  const payPerDollarLoan = i === 0 ? 1 / n : (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

  // The home price P satisfies:
  //   budgetForPiAndTax = (P - downPayment) * payPerDollarLoan + P * taxRateMonthly
  // Solve for P:
  //   budgetForPiAndTax + downPayment * payPerDollarLoan = P * (payPerDollarLoan + taxRateMonthly)
  const denom = payPerDollarLoan + taxRateMonthly;
  let homePrice = (budgetForPiAndTax + downPayment * payPerDollarLoan) / denom;
  if (!Number.isFinite(homePrice) || homePrice < downPayment) homePrice = downPayment;

  const loanAmount = Math.max(0, homePrice - downPayment);
  const principalInterest = loanAmount * payPerDollarLoan;
  const monthlyTax = homePrice * taxRateMonthly;
  const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + monthlyHoa;

  return {
    homePrice,
    loanAmount,
    maxMonthlyHousing,
    principalInterest,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa,
    totalMonthly,
    bindingLimit,
    bars: [
      { label: "Principal & interest", value: principalInterest },
      { label: "Property tax", value: monthlyTax },
      { label: "Insurance", value: monthlyInsurance },
      { label: "HOA", value: monthlyHoa },
    ],
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
