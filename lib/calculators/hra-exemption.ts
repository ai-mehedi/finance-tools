// Pure logic for the HRA (House Rent Allowance) Exemption Calculator.
// Under the Indian Income Tax Act, the exempt portion of HRA is the LEAST of:
//   1. Actual HRA received
//   2. Rent paid minus 10% of salary
//   3. 50% of salary for metro cities, otherwise 40% of salary
// "Salary" here means basic pay plus dearness allowance (DA). All amounts are
// treated as annual figures. The taxable HRA is whatever is not exempt.

export interface HraInput {
  basicSalary: number; // annual basic + DA
  hraReceived: number; // annual HRA received
  rentPaid: number; // annual rent paid
  isMetro: boolean;
}

export interface HraRule {
  label: string;
  value: number;
  color: string;
}

export interface HraResult {
  salary: number;
  hraReceived: number;
  rentPaid: number;
  // The three rule values
  ruleActualHra: number;
  ruleRentMinus10: number;
  rulePercentSalary: number;
  exemptHra: number; // least of the three
  taxableHra: number; // hraReceived minus exemptHra
  metroPct: number; // 50 or 40
  rules: HraRule[];
}

export function computeHraExemption(input: HraInput): HraResult | null {
  const { basicSalary, hraReceived, rentPaid, isMetro } = input;

  if (!Number.isFinite(basicSalary) || basicSalary <= 0) return null;
  if (!Number.isFinite(hraReceived) || hraReceived < 0) return null;
  if (!Number.isFinite(rentPaid) || rentPaid < 0) return null;

  const salary = basicSalary;
  const metroPct = isMetro ? 50 : 40;

  const ruleActualHra = hraReceived;
  const ruleRentMinus10 = Math.max(rentPaid - 0.1 * salary, 0);
  const rulePercentSalary = salary * (metroPct / 100);

  const exemptHra = Math.min(ruleActualHra, ruleRentMinus10, rulePercentSalary);
  const taxableHra = Math.max(hraReceived - exemptHra, 0);

  const rules: HraRule[] = [
    { label: "Actual HRA received", value: ruleActualHra, color: "#fb923c" },
    { label: "Rent minus 10% salary", value: ruleRentMinus10, color: "#fdba74" },
    { label: `${metroPct}% of salary`, value: rulePercentSalary, color: "#a1a1aa" },
  ];

  return {
    salary,
    hraReceived,
    rentPaid,
    ruleActualHra,
    ruleRentMinus10,
    rulePercentSalary,
    exemptHra,
    taxableHra,
    metroPct,
    rules,
  };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
