import { describe, expect, it } from "vitest";
import { getRecentTransactions, getTopProtocols } from "../activity";

const uniswapRouter = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
const unknownContract = "0x000000000000000000000000000000deadbeef";

const transfers = [
  {
    uniqueId: "1",
    to: uniswapRouter,
    value: 1.5,
    asset: "ETH",
    category: "external" as const,
    erc721TokenId: null,
    metadata: { blockTimestamp: new Date().toISOString() },
  },
  {
    uniqueId: "2",
    to: uniswapRouter,
    value: 100,
    asset: "USDC",
    category: "erc20" as const,
    erc721TokenId: null,
    metadata: { blockTimestamp: new Date().toISOString() },
  },
  {
    uniqueId: "3",
    to: unknownContract,
    value: 2,
    asset: "ETH",
    category: "external" as const,
    erc721TokenId: null,
    metadata: { blockTimestamp: new Date().toISOString() },
  },
];

describe("getTopProtocols", () => {
  it("counts interactions per recognized protocol contract", () => {
    expect(getTopProtocols(transfers, 5)).toEqual([
      { name: "Uniswap", interactions: 2 },
    ]);
  });

  it("ignores transfers to unrecognized contracts", () => {
    expect(getTopProtocols(transfers.slice(2), 5)).toEqual([]);
  });

  it("caps results to the requested count", () => {
    expect(getTopProtocols(transfers, 0)).toEqual([]);
  });
});

describe("getRecentTransactions", () => {
  it("labels transfers to a DEX router as swaps", () => {
    const [first] = getRecentTransactions(transfers, 1);
    expect(first).toMatchObject({ id: "1", type: "Swap", protocol: "Uniswap" });
  });

  it("labels transfers to unrecognized contracts as plain transfers", () => {
    const [, , third] = getRecentTransactions(transfers, 3);
    expect(third).toMatchObject({ id: "3", type: "Transfer", protocol: null });
  });

  it("respects the requested count", () => {
    expect(getRecentTransactions(transfers, 2)).toHaveLength(2);
  });

  it("filters out spam-flagged transfers before slicing to count", () => {
    const spamTransfer = {
      uniqueId: "4",
      to: null,
      value: 999,
      asset: "Claim your airdrop reward",
      category: "erc20" as const,
      erc721TokenId: null,
      metadata: null,
    };
    const result = getRecentTransactions([spamTransfer, ...transfers], 10);
    expect(result.find((t) => t.id === "4")).toBeUndefined();
    expect(result).toHaveLength(3);
  });
});
