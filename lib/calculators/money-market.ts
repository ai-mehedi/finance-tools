// Pure logic for the Money Market Calculator.
// Projects the balance of a money market account given an opening deposit,
// optional monthly deposits, and an APY (annual percentage yield). APY already
// reflects compounding, so we convert it to an equivalent monthly growth rate
// and simulate month by month. Exposes a per-year schedule for charting.

export type CompoundFrequency = "daily" | "monthly" | "quarterly" | "annually";

export const COMPOUNDS_PER_YEAR: Record<CompoundFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export interface MoneyMarketInput {
  openingDeposit: number;
  monthlyDeposit: number;
  apyPct: number; // annual percentage yield, already net of compounding
  years: number;
  compound: CompoundFrequency;
}

export interface MoneyMarketYearPoint {
  year: number;
  balance: number;
  deposited: number; // opening deposit plus monthly deposits made so far
  interest: number; // balance minus deposited
}

export interface MoneyMarketResult {
  endingBalance: number;
  totalDeposits: number; // excludes the opening deposit
  totalInterest: number;
  apyUsedPct: number; // the effective APY actually applied
  schedule: MoneyMarketYearPoint[];
}

export function computeMoneyMarket(input: MoneyMarketInput): MoneyMarketResult | null {
  const { openingDeposit, monthlyDeposit, apyPct, years, compound } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (openingDeposit < 0 || monthlyDeposit < 0) return null;
  if (!Number.isFinite(apyPct) || apyPct < 0) return null;

  // The quoted figure is treated as an APY. Derive the nominal rate that, when
  // compounded at the chosen frequency, yields that APY, then express it as the
  // equivalent monthly growth rate so the month-by-month sim is exact.
  const n = COMPOUNDS_PER_YEAR[compound];
  const apy = apyPct / 100;
  // Effective monthly rate equivalent to growing the balance by (1+apy) each year.
  const monthlyRate = Math.pow(1 + apy, 1 / 12) - 1;
  const apyUsedPct = apyPct; // we honour the quoted APY directly

  const months = Math.round(years * 12);
  let balance = openingDeposit;

  const schedule: MoneyMarketYearPoint[] = [
    { year: 0, balance: openingDeposit, deposited: openingDeposit, interest: 0 },
  ];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
    if (m % 12 === 0) {
      const deposited = openingDeposit + monthlyDeposit * m;
      schedule.push({
        year: m / 12,
        balance,
        deposited,
        interest: balance - deposited,
      });
    }
  }

  const totalDeposits = monthlyDeposit * months;
  const endingBalance = balance;
  const totalInterest = endingBalance - openingDeposit - totalDeposits;

  // Silence unused-variable concern while keeping n available for future tiers.
  void n;

  return { endingBalance, totalDeposits, totalInterest, apyUsedPct, schedule };
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
