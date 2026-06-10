// Pure logic for the Overtime Pay Calculator.
// Computes a weekly paycheck made of regular hours plus overtime hours paid at a
// multiplier (1.5x by default, 2x for double time). Returns a breakdown and a
// per-hour schedule so a bar chart can show where each hour's pay lands.

export interface OvertimeInput {
  hourlyRate: number; // base pay per hour
  regularHours: number; // hours paid at the base rate (cap before OT kicks in)
  overtimeHours: number; // hours worked beyond the regular cap
  overtimeMultiplier: number; // e.g. 1.5 for time-and-a-half, 2 for double time
}

export interface OvertimeHourPoint {
  hour: number; // 1-based hour index across the week
  pay: number; // pay earned during this single hour
  overtime: boolean; // whether this hour was paid at the overtime rate
}

export interface OvertimeResult {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  overtimeRate: number; // hourlyRate times multiplier
  totalHours: number;
  overtimePremium: number; // extra dollars earned only because of the OT multiplier
  schedule: OvertimeHourPoint[];
}

export function computeOvertime(input: OvertimeInput): OvertimeResult | null {
  const { hourlyRate, regularHours, overtimeHours, overtimeMultiplier } = input;

  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) return null;
  if (!Number.isFinite(regularHours) || regularHours < 0) return null;
  if (!Number.isFinite(overtimeHours) || overtimeHours < 0) return null;
  if (!Number.isFinite(overtimeMultiplier) || overtimeMultiplier < 1) return null;
  if (regularHours + overtimeHours <= 0) return null;

  const overtimeRate = hourlyRate * overtimeMultiplier;
  const regularPay = hourlyRate * regularHours;
  const overtimePay = overtimeRate * overtimeHours;
  const totalPay = regularPay + overtimePay;
  const totalHours = regularHours + overtimeHours;
  // The premium is what the OT hours earned above the plain base rate.
  const overtimePremium = overtimeHours * hourlyRate * (overtimeMultiplier - 1);

  // Build an hour-by-hour schedule, capped to keep the chart readable.
  const cap = 80;
  const wholeRegular = Math.min(Math.floor(regularHours), cap);
  const schedule: OvertimeHourPoint[] = [];
  let h = 1;
  for (let i = 0; i < wholeRegular && schedule.length < cap; i++, h++) {
    schedule.push({ hour: h, pay: hourlyRate, overtime: false });
  }
  const wholeOvertime = Math.min(Math.floor(overtimeHours), cap - schedule.length);
  for (let i = 0; i < wholeOvertime && schedule.length < cap; i++, h++) {
    schedule.push({ hour: h, pay: overtimeRate, overtime: true });
  }

  return {
    regularPay,
    overtimePay,
    totalPay,
    overtimeRate,
    totalHours,
    overtimePremium,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
