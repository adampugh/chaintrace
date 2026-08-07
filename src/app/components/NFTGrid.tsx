import Image from "next/image";

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
    <div className="border-line text-align w-fill flex flex-col border p-8">
      <h2 className="text-text-secondary mb-8 text-left font-mono text-sm uppercase">
        NFT Holdings
      </h2>
      <div className="grid grid-cols-3">
        {mockNfts.map((nft) => (
          <article key={nft.tokenId} className="border-line border">
            {nft.image ? (
              <Image src={nft.image} alt={nft.name} width={150} height={150} />
            ) : (
              <></>
            )}
            <span>#{nft.tokenId}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
