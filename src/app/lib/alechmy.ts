// const BASE_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

import { cacheLife } from "next/cache";

export type AlchemyToken = {
  address: string;
  network: string;
  tokenAddress: string | null;
  tokenBalance: string;
  tokenMetadata: {
    decimals: number | null;
    name: string | null;
    symbol: string | null;
  };
  tokenPrices: { currency: string; value: string; lastUpdatedAt: string }[];
};

type AlchemyTokensResponse = {
  data: {
    tokens: AlchemyToken[];
    pageKey: string | null;
  };
};

export async function getWalletPortfolio(
  address: string,
): Promise<AlchemyToken[]> {
  "use cache";
  cacheLife("hours");

  const allTokens: AlchemyToken[] = [];
  let pageKey: string | null = null;
  let pageCount = 0;
  const MAX_PAGES = 500; // safety cap — stops a pagination bug from looping forever and burning your API quota; heavily airdropped wallets can legitimately span 100+ pages

  do {
    const res: Response = await fetch(
      `https://api.g.alchemy.com/data/v1/${process.env.ALCHEMY_API_KEY}/assets/tokens/by-address`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: [{ address, networks: ["eth-mainnet"] }],
          withMetadata: true,
          withPrices: true,
          includeNativeTokens: true,
          includeErc20Tokens: true,
          ...(pageKey ? { pageKey } : {}),
        }),
      },
    );

    if (!res.ok) throw new Error(`Alchemy request failed: ${res.status}`);

    const json: AlchemyTokensResponse = await res.json();
    allTokens.push(...json.data.tokens);
    pageKey = json.data.pageKey;
    pageCount++;
  } while (pageKey !== null && pageCount < MAX_PAGES);

  if (pageKey !== null) {
    console.warn(
      `getWalletPortfolio: hit MAX_PAGES (${MAX_PAGES}) for ${address} with more pages remaining — results are truncated`,
    );
  }

  return allTokens;
}
