// Pure logic for the Emergency Fund Calculator.
// A common rule of thumb is to keep 3 to 6 months of essential expenses in an
// easily accessible account. The target fund is monthly expenses multiplied by
// the desired number of months of coverage. We also work out how much more you
// need and how long it will take at your current monthly saving rate.

export interface EmergencyFundInput {
  monthlyExpenses: number;
  monthsCoverage: number;
  currentSavings: number;
  monthlySaving: number; // amount you can set aside each month
}

export interface EmergencyFundResult {
  targetFund: number;
  gap: number; // how much more is needed (0 if already funded)
  funded: boolean;
  monthsToGoal: number | null; // null when no monthly saving or already funded
  currentMonthsCovered: number; // how many months your current savings cover
}

export function computeEmergencyFund(input: EmergencyFundInput): EmergencyFundResult | null {
  const { monthlyExpenses, monthsCoverage, currentSavings, monthlySaving } = input;

  if (!Number.isFinite(monthlyExpenses) || monthlyExpenses <= 0) return null;
  if (!Number.isFinite(monthsCoverage) || monthsCoverage <= 0) return null;
  if (currentSavings < 0 || monthlySaving < 0) return null;

  const targetFund = monthlyExpenses * monthsCoverage;
  const gap = Math.max(0, targetFund - currentSavings);
  const funded = gap <= 0;

  let monthsToGoal: number | null = null;
  if (!funded && monthlySaving > 0) {
    monthsToGoal = Math.ceil(gap / monthlySaving);
  }

  const currentMonthsCovered = currentSavings / monthlyExpenses;

  return { targetFund, gap, funded, monthsToGoal, currentMonthsCovered };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
