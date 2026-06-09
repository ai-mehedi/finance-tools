// Pure logic for the Brokerage Calculator.
// Estimates brokerage fees and statutory charges on an equity trade, then the
// net amount you actually pay (on a buy) or receive (on a sell), plus the
// break-even price needed to recover all costs on a round trip.

export type TradeType = "delivery" | "intraday";

export interface BrokerageInput {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  brokeragePct: number; // percent of turnover charged per side
  brokerageFlatCap: number; // optional flat cap per order, 0 means no cap
}

export interface BrokerageResult {
  buyTurnover: number;
  sellTurnover: number;
  totalTurnover: number;
  brokerage: number; // both sides combined
  regulatoryCharges: number; // exchange, clearing and other statutory fees
  totalCharges: number; // brokerage + regulatory
  grossProfit: number; // before any charges
  netProfit: number; // after all charges
  breakEvenPrice: number; // sell price needed to break even on the round trip
}

// A simple, transparent statutory charge estimate as a fraction of turnover.
// Real rates vary by market and instrument; this is a reasonable default.
const REGULATORY_RATE = 0.0005; // 0.05% of total turnover

export function computeBrokerage(input: BrokerageInput): BrokerageResult | null {
  const { buyPrice, sellPrice, quantity, brokeragePct, brokerageFlatCap } = input;

  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (buyPrice < 0 || sellPrice < 0 || brokeragePct < 0 || brokerageFlatCap < 0) return null;
  if (!Number.isFinite(buyPrice) || !Number.isFinite(sellPrice)) return null;

  const buyTurnover = buyPrice * quantity;
  const sellTurnover = sellPrice * quantity;
  const totalTurnover = buyTurnover + sellTurnover;

  const rawBuyBrokerage = (buyTurnover * brokeragePct) / 100;
  const rawSellBrokerage = (sellTurnover * brokeragePct) / 100;
  const cap = brokerageFlatCap > 0 ? brokerageFlatCap : Infinity;
  const buyBrokerage = Math.min(rawBuyBrokerage, cap);
  const sellBrokerage = Math.min(rawSellBrokerage, cap);
  const brokerage = buyBrokerage + sellBrokerage;

  const regulatoryCharges = totalTurnover * REGULATORY_RATE;
  const totalCharges = brokerage + regulatoryCharges;

  const grossProfit = sellTurnover - buyTurnover;
  const netProfit = grossProfit - totalCharges;

  // Break-even sell price: the sell price at which net profit is zero.
  // Charges that scale with sell turnover are folded into an effective rate.
  const sellChargeRate = brokeragePct / 100 + REGULATORY_RATE;
  const buySideCharges = buyBrokerage + buyTurnover * REGULATORY_RATE;
  const breakEvenPrice =
    quantity > 0 ? (buyTurnover + buySideCharges) / (quantity * (1 - sellChargeRate)) : 0;

  return {
    buyTurnover,
    sellTurnover,
    totalTurnover,
    brokerage,
    regulatoryCharges,
    totalCharges,
    grossProfit,
    netProfit,
    breakEvenPrice,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
