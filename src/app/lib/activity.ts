import { cacheLife } from "next/cache";
import type { Transaction } from "../components/TransactionTable";
import { isSpamToken } from "./spam";

// Verified against Etherscan; addresses are lowercase for matching. This is
// necessarily a small, hand-picked set — most on-chain activity goes
// through custom/proxy contracts, aggregators, or one-off addresses this
// won't recognize, and protocols often have several router/proxy versions
// over time. Coverage will vary a lot by wallet.
const PROTOCOL_CONTRACTS: Record<string, string> = {
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap", // V2 Router02
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "Uniswap", // V3 Router02
  "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b": "Uniswap", // Universal Router
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": "Aave", // V3 Pool
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": "Lido", // stETH
  "0x00000000006c3852cbef3e08e8df289169ede581": "OpenSea", // Seaport 1.1
  "0x00000000000000adc04c56bf30ac9d3c0aaf14dc": "OpenSea", // Seaport 1.5
  "0x000000000000ad05ccc4f10045630fb830b95127": "Blur", // Marketplace
};

const DEX_PROTOCOLS = new Set(["Uniswap"]);

type AlchemyTransfer = {
  uniqueId: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: "external" | "internal" | "erc20" | "erc721" | "erc1155";
  erc721TokenId: string | null;
  metadata: { blockTimestamp: string } | null;
};

type AlchemyTransfersResponse = {
  result: { transfers: AlchemyTransfer[]; pageKey?: string };
};

export type ProtocolInteraction = { name: string; interactions: number };

/**
 * Fetches a wallet's recent sent-transfer history — a single capped page
 * (1000, most recent first) of asset movements, cached hourly. Powers both
 * the top-protocols ranking and the recent-transactions table below, so
 * they share this one call instead of each fetching separately. Pure
 * non-transfer calls like bare approvals never emit a Transfer event, so
 * they're invisible to this API and won't appear in either view.
 */
export async function getWalletTransfers(
  address: string,
): Promise<AlchemyTransfer[]> {
  "use cache";
  cacheLife("hours");

  const res = await fetch(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [
          {
            fromBlock: "0x0",
            toBlock: "latest",
            fromAddress: address,
            category: ["external", "erc20", "erc721", "erc1155", "internal"],
            maxCount: "0x3e8",
            order: "desc",
            withMetadata: true,
          },
        ],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Alchemy transfers request failed: ${res.status}`);
  }

  const json: AlchemyTransfersResponse = await res.json();
  return json.result.transfers;
}

/** Ranks the protocols a wallet has interacted with most (see PROTOCOL_CONTRACTS). */
export function getTopProtocols(
  transfers: AlchemyTransfer[],
  count: number,
): ProtocolInteraction[] {
  const counts = new Map<string, number>();
  for (const transfer of transfers) {
    const protocol = transfer.to
      ? PROTOCOL_CONTRACTS[transfer.to.toLowerCase()]
      : undefined;
    if (!protocol) continue;
    counts.set(protocol, (counts.get(protocol) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, interactions]) => ({ name, interactions }))
    .sort((a, b) => b.interactions - a.interactions)
    .slice(0, count);
}

function formatAmount(transfer: AlchemyTransfer): string {
  if (transfer.category === "erc721" || transfer.category === "erc1155") {
    const tokenId = transfer.erc721TokenId
      ? BigInt(transfer.erc721TokenId).toString()
      : "?";
    return `NFT #${tokenId}`;
  }
  if (transfer.value === null) return "—";
  const amount = transfer.value.toLocaleString(undefined, {
    maximumFractionDigits: transfer.value < 1000 ? 4 : 0,
  });
  return `${amount} ${transfer.asset ?? ""}`.trim();
}

function relativeTime(isoTimestamp: string | undefined): string {
  if (!isoTimestamp) return "—";
  const diffMinutes = Math.floor(
    (Date.now() - new Date(isoTimestamp).getTime()) / 60000,
  );
  if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/**
 * Recent sent transactions. Each transfer entry is its own row rather than
 * being grouped by tx hash — a swap's return leg (tokens coming back) has
 * `from` set to the router, not this wallet, so it's invisible to a
 * fromAddress-only query and can't be paired up here. "Swap" is therefore
 * inferred from the destination being a known DEX router, not from
 * observing both legs; "Approve" never appears, since approvals don't move
 * an asset and emit no Transfer event this API can see.
 *
 * Spam/impersonation transfers (see lib/spam.ts) are filtered out *before*
 * taking the top `count` — otherwise a spam-flooded history pushes real
 * activity off the end of the list entirely rather than just ranking below it.
 */
export function getRecentTransactions(
  transfers: AlchemyTransfer[],
  count: number,
  ownerHint: string | null = null,
): Transaction[] {
  return transfers
    .filter((transfer) => !isSpamToken(null, transfer.asset, ownerHint))
    .slice(0, count)
    .map((transfer) => {
      const protocol = transfer.to
        ? (PROTOCOL_CONTRACTS[transfer.to.toLowerCase()] ?? null)
        : null;

      return {
        id: transfer.uniqueId,
        type: protocol && DEX_PROTOCOLS.has(protocol) ? "Swap" : "Transfer",
        protocol,
        amount: formatAmount(transfer),
        timestamp: relativeTime(transfer.metadata?.blockTimestamp),
      };
    });
}
