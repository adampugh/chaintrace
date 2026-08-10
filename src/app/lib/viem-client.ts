import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { cacheLife } from "next/cache";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  ),
});

export async function resolveAddress(input: string): Promise<string | null> {
  "use cache";
  cacheLife("days");

  if (isAddress(input)) return input.toLowerCase();
  const resolved = await publicClient.getEnsAddress({ name: input });
  return resolved?.toLowerCase() ?? null;
}

// Reverse lookup: address -> its primary ENS name, if it has one set. Used
// to identify the wallet owner's public identity, e.g. for spotting tokens
// that impersonate them (see lib/spam.ts).
export async function getWalletDisplayName(
  address: string,
): Promise<string | null> {
  "use cache";
  cacheLife("days");

  return publicClient.getEnsName({ address: address as `0x${string}` });
}
