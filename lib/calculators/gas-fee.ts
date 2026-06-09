// Pure logic for the Gas Fee Calculator (Ethereum style networks).
// Transaction fee = gas units * gas price. Gas price is quoted in gwei, where
// 1 gwei = 1e-9 ETH. EIP-1559 splits the gas price into a base fee plus a
// priority tip, so total gas price (gwei) = baseFee + priorityFee.

export interface GasFeeInput {
  gasUnits: number; // gas limit, e.g. 21000 for a simple transfer
  baseFeeGwei: number;
  priorityFeeGwei: number;
  ethPriceUsd: number;
}

export interface GasFeeResult {
  totalGasPriceGwei: number;
  feeEth: number;
  feeUsd: number;
  baseFeeEth: number;
  baseFeeUsd: number;
  priorityFeeEth: number;
  priorityFeeUsd: number;
}

const GWEI_PER_ETH = 1_000_000_000; // 1e9 gwei in one ETH

export function computeGasFee(input: GasFeeInput): GasFeeResult | null {
  const { gasUnits, baseFeeGwei, priorityFeeGwei, ethPriceUsd } = input;

  if (!Number.isFinite(gasUnits) || gasUnits <= 0) return null;
  if (!Number.isFinite(baseFeeGwei) || baseFeeGwei < 0) return null;
  if (!Number.isFinite(priorityFeeGwei) || priorityFeeGwei < 0) return null;
  if (!Number.isFinite(ethPriceUsd) || ethPriceUsd < 0) return null;

  const totalGasPriceGwei = baseFeeGwei + priorityFeeGwei;

  const baseFeeEth = (gasUnits * baseFeeGwei) / GWEI_PER_ETH;
  const priorityFeeEth = (gasUnits * priorityFeeGwei) / GWEI_PER_ETH;
  const feeEth = baseFeeEth + priorityFeeEth;

  return {
    totalGasPriceGwei,
    feeEth,
    feeUsd: feeEth * ethPriceUsd,
    baseFeeEth,
    baseFeeUsd: baseFeeEth * ethPriceUsd,
    priorityFeeEth,
    priorityFeeUsd: priorityFeeEth * ethPriceUsd,
  };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd4 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export const formatUSD = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);
export const formatUSD4 = (n: number) => usd4.format(Number.isFinite(n) ? n : 0);

// ETH amounts are tiny, so show up to 6 significant decimals.
export function formatETH(n: number): string {
  if (!Number.isFinite(n)) return "0 ETH";
  return `${n.toFixed(6)} ETH`;
}
