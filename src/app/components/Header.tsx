const data = {
  walletId: "0x8a1F…c92E",
  walletDescription: "Defi power user",
  amount: "$482,910.44",
  percentageChange: "+4.5%",
};

export default function Header() {
  return (
    <header className="border-line flex place-content-between border-b pb-10">
      <div>
        <p className="text-left">
          <span className="border-line text-text-secondary mr-4 rounded-xl border p-2 px-4 text-sm">
            {data.walletId}
          </span>
          <span className="text-accent-1 font-mono text-sm uppercase">
            {data.walletDescription}
          </span>
        </p>
        <p className="mt-6 text-left">
          <span className="mr-4 font-mono text-4xl">{data.amount}</span>
          <span className="text-gain bg-gain-opacity p-1 text-sm">
            {data.percentageChange}
          </span>
        </p>
      </div>
      <button className="gradient-bg text-surface h-fit cursor-pointer rounded-xl border-transparent p-3 px-4 text-center font-bold">
        Analyze portfolio
      </button>
    </header>
  );
}
