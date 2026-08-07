import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import NFTGrid from "../components/NFTGrid";
import OverTimeChart from "../components/OverTimeChart";
import PortfolioCompositionChart from "../components/PortfolioCompositionChart";
import GasSpendChart from "../components/GasSpendChart";
import TopProtocolsChart from "../components/TopProtocolsChart";
import TransactionTable from "../components/TransactionTable";
import AIAnalysis from "../components/AIAnalysis";

export default function Wallet() {
  return (
    <main className="font-display container mx-auto flex max-w-6xl flex-col p-6 text-center">
      <div className="mb-6">
        <nav className="mb-6 flex place-content-between">
          <Link href="/">
            <Image src="/logo-2.webp" alt="Hero" width={150} height={100} />
          </Link>
          <Link
            href="/"
            className="text-text-secondary arrow font-mono text-sm"
          >
            pull another statement
          </Link>
        </nav>
        <Header />
      </div>
      <div className="flex gap-4">
        <OverTimeChart />
        <AIAnalysis />
      </div>
      <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <PortfolioCompositionChart />
        <GasSpendChart />
        <TopProtocolsChart />
        <NFTGrid />
      </div>
      <TransactionTable />
    </main>
  );
}
