import { cacheLife } from "next/cache";
import { z } from "zod";

const AlchemyTokenSchema = z.object({
  address: z.string(),
  network: z.string(),
  tokenAddress: z.string().nullable(),
  tokenBalance: z.string(),
  tokenMetadata: z.object({
    decimals: z.number().nullable(),
    name: z.string().nullable(),
    symbol: z.string().nullable(),
  }),
  tokenPrices: z.array(
    z.object({
      currency: z.string(),
      value: z.string(),
      lastUpdatedAt: z.string(),
    }),
  ),
});

export type AlchemyToken = z.infer<typeof AlchemyTokenSchema>;

const AlchemyTokensResponseSchema = z.object({
  data: z.object({
    tokens: z.array(AlchemyTokenSchema),
    pageKey: z.string().nullable(),
  }),
});

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

    const json = AlchemyTokensResponseSchema.parse(await res.json());
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
