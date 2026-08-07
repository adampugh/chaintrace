import Image from "next/image";
import NoData from "./NoData";

export type NftType = {
  tokenId: number;
  name: string;
  collection: string;
  image?: string;
};

export const mockNfts: NftType[] = [
  {
    tokenId: 4821,
    name: "Azuki #4821",
    collection: "Azuki",
  },
  {
    tokenId: 192,
    name: "CloneX #192",
    collection: "CloneX",
  },
  {
    tokenId: 7734,
    name: "Pudgy Penguin #7734",
    collection: "Pudgy Penguins",
  },
  {
    tokenId: 2201,
    name: "Doodles #2201",
    collection: "Doodles",
  },
  {
    tokenId: 9945,
    name: "Bored Ape #9945",
    collection: "BAYC",
  },
  {
    tokenId: 87,
    name: "Moonbird #87",
    collection: "Moonbirds",
  },
  {
    tokenId: 6543,
    name: "Milady #6543",
    collection: "Milady",
  },
  {
    tokenId: 310,
    name: "CryptoPunk #310",
    collection: "CryptoPunks",
  },
  {
    tokenId: 1459,
    name: "DeGod #1459",
    collection: "DeGods",
  },
];

export default function NFTGrid() {
  return (
    <div className="border-line text-align w-fill bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary mb-8 text-left font-mono text-sm uppercase">
        NFT Holdings
      </h2>
      {mockNfts?.length ? (
        <div className="gradient-articles grid grid-cols-3 gap-4">
          {mockNfts.slice(0, 6).map((nft) => (
            <article
              key={nft.tokenId}
              className="border-line relative h-38 w-38 rounded-xl border"
            >
              {nft.image ? (
                <Image
                  src={nft.image}
                  alt={nft.name}
                  width={150}
                  height={150}
                />
              ) : (
                <></>
              )}
              <span className="absolute bottom-2 left-2 rounded-md p-1 text-xs">
                #{nft.tokenId}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
}
