import { formatUnits } from "viem";
import type { AlchemyToken } from "./alechmy";
import { isSpamToken } from "./spam";

export type Holding = {
  tokenAddress: string | null;
  symbol: string | null;
  balance: number;
  price: number;
  value: number;
};

function toHoldings(
  tokens: AlchemyToken[],
  ownerHint: string | null = null,
): Holding[] {
  const validTokens = tokens.filter(
    (t) =>
      t.tokenPrices.length > 0 &&
      (t.tokenAddress === null || t.tokenMetadata.decimals !== null) &&
      // "Has a price" isn't a spam filter on its own — thin-liquidity scam
      // tokens (including ones impersonating the wallet's own owner) can
      // carry a real, manipulated price and pass right through it.
      !isSpamToken(t.tokenMetadata.name, t.tokenMetadata.symbol, ownerHint),
  );

  return validTokens
    .map((t) => {
      const decimals = t.tokenAddress === null ? 18 : t.tokenMetadata.decimals!;
      const balance = Number(formatUnits(BigInt(t.tokenBalance), decimals));
      const price = parseFloat(t.tokenPrices[0].value);
      return {
        tokenAddress: t.tokenAddress,
        symbol: t.tokenAddress === null ? "ETH" : t.tokenMetadata.symbol,
        balance,
        price,
        value: balance * price,
      };
    })
    .filter(
      // Guard against corrupted feed data (negative/NaN price on some
      // thin-liquidity token) silently throwing off every total downstream.
      (h) => Number.isFinite(h.value) && h.value >= 0,
    );
}

export function computeTotalValue(
  tokens: AlchemyToken[],
  ownerHint: string | null = null,
): number {
  const holdings = toHoldings(tokens, ownerHint);

  // TEMP DEBUG: remove once the spam filter is confirmed to be working.
  const top10 = [...holdings].sort((a, b) => b.value - a.value).slice(0, 10);
  console.log(
    "[DEBUG] top 10 holdings by value (amount × price):",
    top10.map((h) => ({
      symbol: h.symbol,
      amount: h.balance,
      price: h.price,
      value: h.value,
    })),
  );

  return holdings.reduce((sum, item) => sum + item.value, 0);
}

export function getTopHoldings(
  tokens: AlchemyToken[],
  count: number,
  ownerHint: string | null = null,
): Holding[] {
  return toHoldings(tokens, ownerHint)
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

// Alchemy always returns a native-ETH entry (even at zero balance), so this
// is available without any extra fetch.
export function getEthPriceUsd(tokens: AlchemyToken[]): number {
  const eth = tokens.find(
    (t) => t.tokenAddress === null && t.tokenPrices.length > 0,
  );
  return eth ? parseFloat(eth.tokenPrices[0].value) : 0;
}

const ETH_SYMBOLS = new Set([
  "ETH",
  "WETH",
  "STETH",
  "WSTETH",
  "RETH",
  "CBETH",
  "SFRXETH",
  "METH",
  "OETH",
]);

const STABLECOIN_SYMBOLS = new Set([
  "USDC",
  "USDT",
  "DAI",
  "BUSD",
  "TUSD",
  "USDP",
  "GUSD",
  "LUSD",
  "FRAX",
  "SUSD",
  "USDE",
  "PYUSD",
  "CRVUSD",
  "USDD",
  "FDUSD",
]);

const DEFI_SYMBOLS = new Set([
  "UNI",
  "AAVE",
  "COMP",
  "MKR",
  "CRV",
  "SNX",
  "SUSHI",
  "YFI",
  "BAL",
  "LDO",
  "RPL",
  "CVX",
  "1INCH",
  "GMX",
  "ENS",
  "GRT",
  "LINK",
  "MATIC",
  "POL",
  "ARB",
  "OP",
  "PENDLE",
  "FXS",
  "DYDX",
  "KNC", // Kyber Network Crystal
  "KNCL", // Kyber Network Crystal (legacy, pre-2020 migration)
  "ZRX", // 0x Protocol
  "BNT", // Bancor
  "REN", // Ren Protocol (legacy)
  "RUNE", // THORChain
  "REP", // Augur (legacy)
]);

type Category =
  | "ETH & Staked ETH"
  | "Stablecoins"
  | "DeFi tokens"
  | "NFTs"
  | "Other";

const CATEGORY_COLOR: Record<Category, string> = {
  "ETH & Staked ETH": "#7857FF",
  Stablecoins: "#28C6E8",
  "DeFi tokens": "#474E70",
  NFTs: "#FF6B9D",
  Other: "#232A42",
};

// Aave's interest-bearing "aToken" convention: a lowercase "a" prefix
// directly followed by the underlying asset's (uppercase-leading) symbol —
// e.g. aWETH, aUSDC, aEthWETH. Checked against the *raw* symbol since the
// uppercased form used below would erase the distinguishing lowercase "a".
const AAVE_ATOKEN_PATTERN = /^a[A-Z]/;

// Compound's equivalent convention: a lowercase "c" prefix, e.g. cDAI,
// cETH, cUSDC. Same rationale as Aave's aTokens above.
const COMPOUND_CTOKEN_PATTERN = /^c[A-Z]/;

// Categorized purely from the already-fetched token list (symbol + whether
// it's the native asset) — no extra network calls. Alchemy doesn't return a
// token "category", so this is a best-effort classification by known symbols.
function classify(holding: Holding): Category {
  const rawSymbol = holding.symbol;
  const symbol = rawSymbol?.toUpperCase();

  if (holding.tokenAddress === null || (symbol && ETH_SYMBOLS.has(symbol))) {
    return "ETH & Staked ETH";
  }
  if (symbol && STABLECOIN_SYMBOLS.has(symbol)) return "Stablecoins";
  if (symbol && DEFI_SYMBOLS.has(symbol)) return "DeFi tokens";
  if (
    rawSymbol &&
    (AAVE_ATOKEN_PATTERN.test(rawSymbol) || COMPOUND_CTOKEN_PATTERN.test(rawSymbol))
  ) {
    return "DeFi tokens";
  }
  return "Other";
}

export type CompositionSlice = { name: string; value: number; color: string };

export function getPortfolioComposition(
  tokens: AlchemyToken[],
  nftValueUsd = 0,
  ownerHint: string | null = null,
): CompositionSlice[] {
  const holdings = toHoldings(tokens, ownerHint);
  const totalsByCategory = new Map<Category, number>();

  for (const holding of holdings) {
    const category = classify(holding);
    totalsByCategory.set(
      category,
      (totalsByCategory.get(category) ?? 0) + holding.value,
    );
  }

  if (nftValueUsd > 0) totalsByCategory.set("NFTs", nftValueUsd);

  const grandTotal =
    holdings.reduce((sum, h) => sum + h.value, 0) + Math.max(0, nftValueUsd);
  if (grandTotal <= 0) return [];

  const order: Category[] = [
    "ETH & Staked ETH",
    "Stablecoins",
    "DeFi tokens",
    "NFTs",
    "Other",
  ];

  return order
    .map((name) => ({
      name,
      value: ((totalsByCategory.get(name) ?? 0) / grandTotal) * 100,
      color: CATEGORY_COLOR[name],
    }))
    .filter((slice) => slice.value > 0);
}

const CATEGORY_DESCRIPTION: Record<Category, string> = {
  "ETH & Staked ETH": "ETH holder",
  Stablecoins: "Stablecoin holder",
  "DeFi tokens": "DeFi power user",
  NFTs: "NFT collector",
  Other: "Long-tail token holder",
};

const DOMINANT_CATEGORY_THRESHOLD = 50; // %

/** A short label for whatever category dominates the portfolio composition. */
export function getWalletDescription(composition: CompositionSlice[]): string {
  if (composition.length === 0) return "New wallet";

  const top = [...composition].sort((a, b) => b.value - a.value)[0];
  if (top.value < DOMINANT_CATEGORY_THRESHOLD) return "Diversified holder";

  return CATEGORY_DESCRIPTION[top.name as Category] ?? "Diversified holder";
}
