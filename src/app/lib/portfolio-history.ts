import { cacheLife } from "next/cache";
import type { Holding } from "./valuation";

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

type HistoricalPricePoint = { value: string; timestamp: string };

async function getHistoricalPrices(
  tokenAddress: string | null,
  startTime: Date,
  endTime: Date,
): Promise<HistoricalPricePoint[]> {
  const body =
    tokenAddress === null
      ? {
          symbol: "ETH",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          interval: "1d",
        }
      : {
          network: "eth-mainnet",
          address: tokenAddress,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          interval: "1d",
        };

  const res = await fetch(
    `https://api.g.alchemy.com/prices/v1/${process.env.ALCHEMY_API_KEY}/tokens/historical`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  // Many long-tail/spam tokens have no historical price coverage — treat
  // that holding as frozen (see below) rather than failing the whole chart.
  if (!res.ok) return [];

  const json: { data: HistoricalPricePoint[] } = await res.json();
  return json.data ?? [];
}

// Thinly-traded/spam tokens routinely show 10x+ price swings that reflect
// bad liquidity data, not something the wallet actually experienced — and
// since we have no historical balance data, floating a holding also assumes
// it was held at today's balance the whole time, which is rarely true for
// something this volatile (usually a recent bulk airdrop). Above this ratio
// we don't trust the series enough to backdate the holding at all.
const MAX_TRUSTED_PRICE_RATIO = 5;

function isPriceSeriesStable(prices: HistoricalPricePoint[]): boolean {
  if (prices.length === 0) return false;
  const values = prices.map((p) => parseFloat(p.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min > 0 && max / min <= MAX_TRUSTED_PRICE_RATIO;
}

function closestPrice(
  prices: HistoricalPricePoint[],
  target: Date,
): number | null {
  if (prices.length === 0) return null;

  let closest = prices[0];
  let closestDiff = Infinity;
  for (const point of prices) {
    const diff = Math.abs(
      new Date(point.timestamp).getTime() - target.getTime(),
    );
    if (diff < closestDiff) {
      closest = point;
      closestDiff = diff;
    }
  }
  return parseFloat(closest.value);
}

/**
 * Approximates portfolio value over the last 12 months. True historical
 * balance + price data isn't practical to fetch for every token a wallet
 * holds (some wallets here hold 10,000+), so only the wallet's current top
 * holdings are revalued at each month's historical price; everything else
 * is held fixed at today's value. This keeps the series anchored to the
 * real current total while still reflecting the price moves of whatever
 * actually makes up most of the wallet, not just ETH specifically.
 */
export async function getWalletValueOverTime(
  topHoldings: Holding[],
  totalValueNow: number,
): Promise<{ month: string; value: number }[]> {
  "use cache";
  cacheLife("hours");

  const monthsAgo = (n: number) => {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - n);
    return d;
  };

  const points = Array.from({ length: 12 }, (_, i) => monthsAgo(11 - i));

  const pricesByHolding = await Promise.all(
    topHoldings.map((h) =>
      getHistoricalPrices(h.tokenAddress, points[0], points[points.length - 1]),
    ),
  ).then((series) =>
    series.map((prices) => (isPriceSeriesStable(prices) ? prices : [])),
  );

  const frozenValue =
    totalValueNow - topHoldings.reduce((sum, h) => sum + h.value, 0);

  return points.map((date) => {
    const floatingValue = topHoldings.reduce((sum, holding, i) => {
      const price = closestPrice(pricesByHolding[i], date);
      return sum + (price !== null ? holding.balance * price : holding.value);
    }, 0);

    return {
      month: MONTH_LABELS[date.getUTCMonth()],
      value: frozenValue + floatingValue,
    };
  });
}
