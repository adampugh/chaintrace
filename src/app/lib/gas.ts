import { formatUnits } from "viem";
import { cacheLife } from "next/cache";
import { publicClient } from "./viem-client";

const AVG_BLOCK_TIME_SECONDS = 12.05; // post-Merge Ethereum is ~12s/block
const GAS_UNITS_PER_TX = 21000; // simple-transfer baseline

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type GasSpendPoint = { month: string; gas: number };

/**
 * Approximates gas spend as 6 monthly samples across the last 5 months.
 * True per-transaction gas cost needs a receipt per transaction — for an
 * active wallet that's easily hundreds of extra calls, and scales with how
 * active the wallet is. Instead this samples transaction count (nonce) and
 * base fee at 7 monthly block-height anchors (a fixed ~13 RPC calls no
 * matter how active the wallet is) and estimates each month's spend as
 * (transactions sent that month) × 21,000 gas × that month's base fee.
 * This is a floor, not an appraisal: it ignores priority-fee tips and
 * assumes simple-transfer-level gas per tx, so contract-heavy wallets will
 * show less than they actually spent.
 */
export async function getGasSpendOverTime(
  address: string,
  ethPriceUsd: number,
): Promise<GasSpendPoint[]> {
  "use cache";
  cacheLife("hours");

  const addr = address as `0x${string}`;
  const latestBlock = await publicClient.getBlock();

  const estimateBlockNumber = (monthsAgo: number): bigint => {
    if (monthsAgo === 0) return latestBlock.number;
    const target = new Date(Number(latestBlock.timestamp) * 1000);
    target.setUTCMonth(target.getUTCMonth() - monthsAgo);
    const secondsAgo =
      Number(latestBlock.timestamp) - target.getTime() / 1000;
    const blockOffset = Math.max(
      0,
      Math.round(secondsAgo / AVG_BLOCK_TIME_SECONDS),
    );
    return blockOffset > Number(latestBlock.number)
      ? BigInt(0)
      : latestBlock.number - BigInt(blockOffset);
  };

  // Oldest first: 6 months ago (baseline only) through now.
  const anchors = [6, 5, 4, 3, 2, 1, 0].map((monthsAgo) => ({
    monthsAgo,
    blockNumber: estimateBlockNumber(monthsAgo),
  }));

  const txCounts = await Promise.all(
    anchors.map(({ blockNumber }) =>
      publicClient.getTransactionCount({ address: addr, blockNumber }),
    ),
  );

  // The 6-months-ago anchor is only needed as a baseline for the first
  // delta below, so its block (timestamp/base fee) is never used.
  const labeledAnchors = anchors.slice(1);
  const blocks = await Promise.all(
    labeledAnchors.map(({ blockNumber }) =>
      blockNumber === latestBlock.number
        ? latestBlock
        : publicClient.getBlock({ blockNumber }),
    ),
  );

  return labeledAnchors.map((_, i) => {
    const txSent = Math.max(0, txCounts[i + 1] - txCounts[i]);
    const baseFee = blocks[i].baseFeePerGas ?? BigInt(0);
    const gasSpentWei = BigInt(txSent) * BigInt(GAS_UNITS_PER_TX) * baseFee;
    const gasSpentUsd = Number(formatUnits(gasSpentWei, 18)) * ethPriceUsd;

    return {
      month: MONTH_LABELS[new Date(Number(blocks[i].timestamp) * 1000).getUTCMonth()],
      gas: gasSpentUsd,
    };
  });
}
