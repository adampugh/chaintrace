import { cacheLife } from "next/cache";
import { z } from "zod";
import type { NftType } from "../components/NFTGrid";

const AlchemyNftSchema = z.object({
  tokenId: z.string(),
  balance: z.string(),
  name: z.string().nullable(),
  contract: z.object({
    name: z.string().nullable(),
    isSpam: z.boolean(),
    openSeaMetadata: z.object({
      imageUrl: z.string().nullable(),
      floorPrice: z.number().nullable(),
    }),
  }),
  image: z.object({
    cachedUrl: z.string().nullable(),
    thumbnailUrl: z.string().nullable(),
  }),
});

const AlchemyNftsResponseSchema = z.object({
  data: z.object({
    ownedNfts: z.array(AlchemyNftSchema),
    pageKey: z.string().nullable(),
  }),
});

export type NftSummary = {
  items: NftType[];
  // Sum of (collection floor price × balance) across every non-spam NFT
  // scanned, in ETH — floor price is Alchemy/OpenSea's convention for
  // mainnet collections. This is a rough proxy for NFT holdings' value,
  // not an appraisal: floor price rarely reflects what a specific token
  // would actually sell for, and thin/delisted collections often have no
  // floor price data at all (counted as 0 here).
  totalValueEth: number;
};

/**
 * Scans a wallet's NFTs, filtering out spam client-side (Alchemy's
 * excludeFilters/spamConfidenceLevel params didn't actually filter
 * anything server-side when tested — heavily-airdropped wallets came back
 * 95%+ spam regardless). Returns the first `displayCount` real NFTs for
 * the grid, and sums floor value across every real NFT the scan covers
 * (bounded by MAX_PAGES) for the composition chart — one paginated fetch
 * serving both, rather than a separate call for each.
 */
export async function getWalletNftSummary(
  address: string,
  displayCount: number,
): Promise<NftSummary> {
  "use cache";
  cacheLife("hours");

  const items: NftType[] = [];
  let totalValueEth = 0;
  let pageKey: string | null = null;
  let pageCount = 0;
  const MAX_PAGES = 30; // safety cap for extremely spam-heavy / huge collections

  do {
    const res = await fetch(
      `https://api.g.alchemy.com/data/v1/${process.env.ALCHEMY_API_KEY}/assets/nfts/by-address`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: [{ address, networks: ["eth-mainnet"] }],
          withMetadata: true,
          pageSize: 100,
          ...(pageKey ? { pageKey } : {}),
        }),
      },
    );

    if (!res.ok) throw new Error(`Alchemy NFT request failed: ${res.status}`);

    const json = AlchemyNftsResponseSchema.parse(await res.json());

    for (const nft of json.data.ownedNfts) {
      if (nft.contract.isSpam) continue;

      const floorPrice = nft.contract.openSeaMetadata.floorPrice;
      const balance = Number(nft.balance) || 1;
      if (typeof floorPrice === "number" && Number.isFinite(floorPrice)) {
        totalValueEth += floorPrice * balance;
      }

      if (items.length < displayCount) {
        const collection = nft.contract.name ?? "Unknown collection";
        items.push({
          tokenId: nft.tokenId,
          name: nft.name || `${collection} #${nft.tokenId}`,
          collection,
          image:
            nft.image.cachedUrl ??
            nft.image.thumbnailUrl ??
            nft.contract.openSeaMetadata.imageUrl ??
            undefined,
        });
      }
    }

    pageKey = json.data.pageKey;
    pageCount++;
  } while (pageKey !== null && pageCount < MAX_PAGES);

  if (pageKey !== null) {
    console.warn(
      `getWalletNftSummary: hit MAX_PAGES (${MAX_PAGES}) for ${address} with more pages remaining — NFT value is a lower bound`,
    );
  }

  return { items, totalValueEth };
}
