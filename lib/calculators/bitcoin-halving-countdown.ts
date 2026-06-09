// Pure logic for the Bitcoin Halving Countdown tool.
// Bitcoin halves its block subsidy every 210,000 blocks. Given a current block
// height and the average time per block, this estimates how many blocks remain
// until the next halving, roughly how long that will take, and the projected date.

export const HALVING_INTERVAL = 210_000;
export const INITIAL_SUBSIDY = 50; // BTC per block at genesis

export interface HalvingInput {
  currentBlock: number; // latest mined block height
  avgBlockMinutes: number; // average minutes per block (target is ~10)
  /** Reference timestamp in ms for "now"; passed in so the result is deterministic. */
  nowMs: number;
}

export interface HalvingResult {
  currentBlock: number;
  nextHalvingBlock: number;
  blocksRemaining: number;
  minutesRemaining: number;
  daysRemaining: number;
  estimatedDateMs: number;
  currentSubsidy: number; // BTC per block now
  nextSubsidy: number; // BTC per block after the halving
  halvingNumber: number; // which halving is next (1, 2, 3, ...)
  progressPct: number; // progress through the current 210k epoch, 0 to 100
}

export function computeHalving(input: HalvingInput): HalvingResult | null {
  const { currentBlock, avgBlockMinutes, nowMs } = input;

  if (!Number.isFinite(currentBlock) || currentBlock < 0) return null;
  if (!Number.isFinite(avgBlockMinutes) || avgBlockMinutes <= 0) return null;
  if (!Number.isFinite(nowMs)) return null;

  const epoch = Math.floor(currentBlock / HALVING_INTERVAL); // 0-based epochs already passed
  const nextHalvingBlock = (epoch + 1) * HALVING_INTERVAL;
  const blocksRemaining = nextHalvingBlock - currentBlock;

  const blocksIntoEpoch = currentBlock - epoch * HALVING_INTERVAL;
  const progressPct = (blocksIntoEpoch / HALVING_INTERVAL) * 100;

  const minutesRemaining = blocksRemaining * avgBlockMinutes;
  const daysRemaining = minutesRemaining / (60 * 24);
  const estimatedDateMs = nowMs + minutesRemaining * 60 * 1000;

  // Subsidy halves each epoch: 50, 25, 12.5, ...
  const currentSubsidy = INITIAL_SUBSIDY / Math.pow(2, epoch);
  const nextSubsidy = currentSubsidy / 2;
  const halvingNumber = epoch + 1;

  return {
    currentBlock,
    nextHalvingBlock,
    blocksRemaining,
    minutesRemaining,
    daysRemaining,
    estimatedDateMs,
    currentSubsidy,
    nextSubsidy,
    halvingNumber,
    progressPct,
  };
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const formatDate = (ms: number) =>
  Number.isFinite(ms) ? dateFmt.format(new Date(ms)) : "—";

const numFmt = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => numFmt.format(Number.isFinite(n) ? Math.round(n) : 0);

/** Break a day count into a friendly "X years, Y months, Z days" style string. */
export function formatDuration(days: number): string {
  if (!Number.isFinite(days) || days < 0) return "—";
  const total = Math.round(days);
  const years = Math.floor(total / 365);
  const months = Math.floor((total % 365) / 30);
  const rem = (total % 365) % 30;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  parts.push(`${rem} ${rem === 1 ? "day" : "days"}`);
  return parts.join(", ");
}

const btcFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });
export const formatBTC = (n: number) => `${btcFmt.format(Number.isFinite(n) ? n : 0)} BTC`;
