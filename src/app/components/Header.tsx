const data = {
  percentageChange: "+4.5%",
};

const formatAddress = (str: string) => {
  return `${str.substring(0, 5)}...${str.substring(str.length - 5)}`;
};

import { currencyFormatter } from "../lib/format";

export default function Header({
  address,
  totalValue,
  walletDescription,
}: {
  address: string;
  totalValue: number;
  walletDescription: string;
}) {
  return (
    <header className="border-line flex place-content-between border-b pb-4">
      <div>
        <p className="text-left">
          <span className="border-line text-text-secondary mr-4 rounded-xl border p-2 px-4 text-sm">
            {formatAddress(address)}
          </span>
          <span className="text-accent-1 font-mono text-sm uppercase">
            {walletDescription}
          </span>
        </p>
        <p className="mt-6 text-left">
          <span className="mr-4 font-mono text-4xl">
            {currencyFormatter.format(totalValue)}
          </span>
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
