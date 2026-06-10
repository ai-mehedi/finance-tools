// Pure logic for the Retirement Calculator.
// Projects savings from today to retirement, then checks whether the resulting
// nest egg can fund a target annual spend through retirement using the 4% style
// safe-withdrawal idea, while also reporting the income the corpus can sustain.
// Simulates year by year so the accumulation chart stays consistent.

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  preRetReturnPct: number; // expected return before retirement, % per year
  desiredAnnualIncome: number; // spend target in today's dollars, per year
  withdrawalRatePct: number; // safe withdrawal rate, e.g. 4
}

export interface RetirementYearPoint {
  age: number;
  balance: number;
  contributed: number; // current savings plus contributions to date
  interest: number; // balance minus contributed
}

export interface RetirementResult {
  nestEgg: number; // projected balance at retirement
  totalContributions: number; // contributions only, excludes starting savings
  totalGrowth: number;
  yearsToRetire: number;
  requiredNestEgg: number; // income / withdrawal rate
  sustainableIncome: number; // nestEgg times withdrawal rate
  surplus: number; // nestEgg minus requiredNestEgg
  onTrack: boolean;
  schedule: RetirementYearPoint[];
}

export function computeRetirement(input: RetirementInput): RetirementResult | null {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    preRetReturnPct,
    desiredAnnualIncome,
    withdrawalRatePct,
  } = input;

  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) return null;
  if (retirementAge <= currentAge) return null;
  if (currentSavings < 0 || monthlyContribution < 0) return null;
  if (!Number.isFinite(preRetReturnPct)) return null;
  if (desiredAnnualIncome < 0) return null;
  if (!(withdrawalRatePct > 0)) return null;

  const yearsToRetire = retirementAge - currentAge;
  const months = Math.round(yearsToRetire * 12);
  const monthlyRate = Math.pow(1 + preRetReturnPct / 100, 1 / 12) - 1;

  let balance = currentSavings;
  const schedule: RetirementYearPoint[] = [
    { age: currentAge, balance: currentSavings, contributed: currentSavings, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (m % 12 === 0) {
      const contributed = currentSavings + monthlyContribution * m;
      schedule.push({
        age: currentAge + m / 12,
        balance,
        contributed,
        interest: balance - contributed,
      });
    }
  }

  const nestEgg = balance;
  const totalContributions = monthlyContribution * months;
  const totalGrowth = nestEgg - currentSavings - totalContributions;

  const wr = withdrawalRatePct / 100;
  const requiredNestEgg = desiredAnnualIncome / wr;
  const sustainableIncome = nestEgg * wr;
  const surplus = nestEgg - requiredNestEgg;
  const onTrack = surplus >= 0;

  return {
    nestEgg,
    totalContributions,
    totalGrowth,
    yearsToRetire,
    requiredNestEgg,
    sustainableIncome,
    surplus,
    onTrack,
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
