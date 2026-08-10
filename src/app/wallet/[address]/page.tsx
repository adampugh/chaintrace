import { Suspense } from "react";
import { getWalletPortfolio } from "@/app/lib/alechmy";
import { resolveAddress, getWalletDisplayName } from "@/app/lib/viem-client";
import { ownerHintFromEnsName } from "@/app/lib/spam";
import { getWalletValueOverTime } from "@/app/lib/portfolio-history";
import { getWalletNftSummary } from "@/app/lib/nft";
import { getGasSpendOverTime } from "@/app/lib/gas";
import {
  getWalletTransfers,
  getTopProtocols,
  getRecentTransactions,
} from "@/app/lib/activity";
import {
  computeTotalValue,
  getTopHoldings,
  getPortfolioComposition,
  getEthPriceUsd,
  getWalletDescription,
} from "@/app/lib/valuation";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import NFTGrid from "../../components/NFTGrid";
import OverTimeChart from "../../components/OverTimeChart";
import PortfolioCompositionChart from "../../components/PortfolioCompositionChart";
import GasSpendChart from "../../components/GasSpendChart";
import TopProtocolsChart from "../../components/TopProtocolsChart";
import TransactionTable from "../../components/TransactionTable";
import AIAnalysis from "../../components/AIAnalysis";

const TOP_HOLDINGS_TRACKED = 10;
const NFTS_TO_SHOW = 6;
const TOP_PROTOCOLS_TO_SHOW = 4;
const TRANSACTIONS_TO_SHOW = 8;

export default function Wallet({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  return (
    <main className="font-display container mx-auto flex max-w-6xl flex-col p-6 text-center">
      <nav className="mb-6 flex place-content-between">
        <Link href="/">
          <Image src="/logo-2.webp" alt="Hero" width={150} height={100} />
        </Link>
        <Link href="/" className="text-text-secondary arrow font-mono text-sm">
          pull another statement
        </Link>
      </nav>
      <Suspense
        fallback={<p className="text-text-secondary mb-6">Loading wallet…</p>}
      >
        <WalletContent params={params} />
      </Suspense>
    </main>
  );
}

async function WalletContent({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const resolvedAddress = await resolveAddress(decodeURIComponent(address));
  if (!resolvedAddress) notFound();

  const [tokens, nftSummary, transfers, displayName] = await Promise.all([
    getWalletPortfolio(resolvedAddress),
    getWalletNftSummary(resolvedAddress, NFTS_TO_SHOW),
    getWalletTransfers(resolvedAddress),
    getWalletDisplayName(resolvedAddress),
  ]);
  const ownerHint = ownerHintFromEnsName(displayName);

  const topProtocols = getTopProtocols(transfers, TOP_PROTOCOLS_TO_SHOW);
  const recentTransactions = getRecentTransactions(
    transfers,
    TRANSACTIONS_TO_SHOW,
    ownerHint,
  );

  const ethPriceUsd = getEthPriceUsd(tokens);
  const fungibleValue = computeTotalValue(tokens, ownerHint);
  const nftValueUsd = nftSummary.totalValueEth * ethPriceUsd;
  const totalValue = fungibleValue + nftValueUsd;

  const topHoldings = getTopHoldings(tokens, TOP_HOLDINGS_TRACKED, ownerHint);
  const [valueOverTime, gasSpend] = await Promise.all([
    getWalletValueOverTime(topHoldings, totalValue),
    getGasSpendOverTime(resolvedAddress, ethPriceUsd),
  ]);
  const composition = getPortfolioComposition(tokens, nftValueUsd, ownerHint);
  const walletDescription = getWalletDescription(composition);

  return (
    <>
      <div className="mb-6">
        <Header
          address={resolvedAddress}
          totalValue={totalValue}
          walletDescription={walletDescription}
        />
      </div>
      <div className="flex gap-4">
        <OverTimeChart data={valueOverTime} />
        <AIAnalysis />
      </div>
      <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <PortfolioCompositionChart data={composition} />
        <GasSpendChart data={gasSpend} />
        <TopProtocolsChart protocols={topProtocols} />
        <NFTGrid nfts={nftSummary.items} />
      </div>
      <TransactionTable transactions={recentTransactions} />
    </>
  );
}
