import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="font-display container mx-auto flex max-w-3xl flex-col p-10 text-center">
      <div className="mx-auto mb-10">
        <Image src="/logo-2.webp" alt="Hero" width={300} height={150} />
      </div>
      <div className="mx-auto max-w-2xl pb-10 text-center">
        <h2 className="text-accent-2 font-mono text-sm uppercase">
          On-chain wallet analysis
        </h2>
        <h1 className="font-display mx-auto max-w-md p-4 text-5xl font-bold">
          Pull a statement for any wallet.
        </h1>
        <p className="text-text-secondary font-display mx-auto max-w-lg text-center">
          Paste an address or ENS name to see holdings, activity, and an AI read
          on the portfolio — no wallet connection required.
        </p>
      </div>
      <div className="bg-surface border-line mb-6 rounded-xl border p-6 text-left">
        <p className="text-text-muted pb-2 font-mono text-sm uppercase">
          Wallet address or ENS name
        </p>
        <div className="space-between flex gap-4">
          <input
            type="text"
            placeholder="0x... or name.eth"
            className="border-line bg-background flex flex-1 rounded-xl border p-2 font-mono"
          />
          <button className="gradient-bg text-surface cursor-pointer rounded-xl border-transparent p-1 px-4 text-center font-bold">
            Pull statement
          </button>
        </div>
      </div>
      <p className="text-text-muted font-mono text-sm">
        Works with any public wallet · read-only, nothing is stored
      </p>
      <div className="mx-auto mt-8 flex gap-4">
        <Link
          href="/wallet"
          className="glow-button font-display text-text-secondary border-line bg-surface rounded-4xl border p-2 px-4 text-sm"
        >
          <span className="arrow relative z-10">Try a DeFi power user</span>
        </Link>
        <a
          href=""
          className="glow-button font-display text-text-secondary border-line bg-surface rounded-4xl border p-2 px-4 text-sm"
        >
          <span className="arrow relative z-10">Try an NFT collector</span>
        </a>
        <a
          href=""
          className="glow-button font-display text-text-secondary border-line bg-surface rounded-4xl border p-2 px-4 text-sm"
        >
          <span className="arrow relative z-10">Try a long-term holder</span>
        </a>
      </div>
      <div className="border-line bg-surface mx-auto mt-10 mb-10 grid grid-cols-1 rounded-xl border md:grid-cols-3">
        <div className="border-line flex flex-col border-r p-6 text-left">
          <p className="text-accent-2 pb-2 font-mono text-sm">01</p>
          <h4>Composition</h4>
          <p className="text-text-secondary pt-2 text-sm">
            See the split across DeFi tokens, stablecoins, NFTs, and everything
            else.
          </p>
        </div>
        <div className="border-line flex flex-col border-r p-6 text-left">
          <p className="text-accent-2 pb-2 font-mono text-sm">02</p>
          <h4>Spending pattern</h4>
          <p className="text-text-secondary pt-2 text-sm">
            Gas spend and activity trend over time, in plain terms.
          </p>
        </div>
        <div className="flex flex-col p-6 text-left">
          <p className="text-accent-2 pb-2 font-mono text-sm">03</p>
          <h4>Protocol activity</h4>
          <p className="text-text-secondary pt-2 text-sm">
            Which protocols this wallet actually uses, ranked by interaction.
          </p>
        </div>
      </div>
      <p className="text-text-muted font-mono text-sm">
        Built with Next.js, wagmi, and an AI read that never touches your keys.
      </p>
    </main>
  );
}
