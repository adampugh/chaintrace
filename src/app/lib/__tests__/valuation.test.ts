import { describe, expect, it } from "vitest";
import type { AlchemyToken } from "../alechmy";
import {
  computeTotalValue,
  getEthPriceUsd,
  getPortfolioComposition,
  getTopHoldings,
  getWalletDescription,
} from "../valuation";

function token(overrides: Partial<AlchemyToken> = {}): AlchemyToken {
  return {
    address: "0xowner",
    network: "eth-mainnet",
    tokenAddress: null,
    tokenBalance: "0",
    tokenMetadata: { decimals: null, name: null, symbol: null },
    tokenPrices: [],
    ...overrides,
  };
}

const eth = token({
  tokenAddress: null,
  tokenBalance: "2000000000000000000", // 2 ETH
  tokenMetadata: { decimals: null, name: null, symbol: null },
  tokenPrices: [{ currency: "usd", value: "2000", lastUpdatedAt: "" }],
});

const usdc = token({
  tokenAddress: "0xusdc",
  tokenBalance: "1000000", // 1 USDC (6 decimals)
  tokenMetadata: { decimals: 6, name: "USD Coin", symbol: "USDC" },
  tokenPrices: [{ currency: "usd", value: "1", lastUpdatedAt: "" }],
});

const spam = token({
  tokenAddress: "0xspam",
  tokenBalance: "1000000000000000000",
  tokenMetadata: { decimals: 18, name: "Claim your reward", symbol: "CLAIM" },
  tokenPrices: [{ currency: "usd", value: "1000", lastUpdatedAt: "" }],
});

const noPrice = token({
  tokenAddress: "0xnoprice",
  tokenBalance: "1000000000000000000",
  tokenMetadata: { decimals: 18, name: "Illiquid", symbol: "ILQ" },
  tokenPrices: [],
});

const portfolio = [eth, usdc, spam, noPrice];

describe("computeTotalValue", () => {
  it("sums valid holdings and excludes spam/priceless tokens", () => {
    expect(computeTotalValue(portfolio)).toBeCloseTo(4001, 6);
  });

  it("returns 0 for an empty portfolio", () => {
    expect(computeTotalValue([])).toBe(0);
  });
});

describe("getTopHoldings", () => {
  it("ranks holdings by value descending", () => {
    const top = getTopHoldings(portfolio, 2);
    expect(top.map((h) => h.symbol)).toEqual(["ETH", "USDC"]);
  });
});

describe("getEthPriceUsd", () => {
  it("reads the price from the native ETH entry", () => {
    expect(getEthPriceUsd(portfolio)).toBe(2000);
  });

  it("returns 0 when there is no ETH entry", () => {
    expect(getEthPriceUsd([usdc])).toBe(0);
  });
});

describe("getPortfolioComposition", () => {
  it("buckets value by category as percentages that reflect dominance", () => {
    const composition = getPortfolioComposition(portfolio);
    const eth = composition.find((c) => c.name === "ETH & Staked ETH");
    const stable = composition.find((c) => c.name === "Stablecoins");
    expect(eth?.value).toBeCloseTo((4000 / 4001) * 100, 6);
    expect(stable?.value).toBeCloseTo((1 / 4001) * 100, 6);
  });

  it("returns an empty array when the wallet has no value", () => {
    expect(getPortfolioComposition([])).toEqual([]);
  });
});

describe("getWalletDescription", () => {
  it("labels a wallet dominated by one category", () => {
    const composition = getPortfolioComposition(portfolio);
    expect(getWalletDescription(composition)).toBe("ETH holder");
  });

  it("labels an empty portfolio as a new wallet", () => {
    expect(getWalletDescription([])).toBe("New wallet");
  });
});
