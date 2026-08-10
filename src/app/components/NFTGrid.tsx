import NoData from "./NoData";

export type NftType = {
  tokenId: string;
  name: string;
  collection: string;
  image?: string;
};

const truncateStr = (str: string) => {
  return str.length > 4 ? `${str.substring(0, 4)}...` : str;
};

export default function NFTGrid({ nfts }: { nfts: NftType[] }) {
  return (
    <div className="border-line text-align w-fill bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary mb-8 text-left font-mono text-sm uppercase">
        NFT Holdings
      </h2>
      {nfts?.length ? (
        <div className="gradient-articles grid grid-cols-3 gap-4">
          {nfts.slice(0, 6).map((nft) => (
            <article
              key={`${nft.collection}-${nft.tokenId}`}
              className="border-line relative h-38 w-38 rounded-xl border"
            >
              {nft.image ? (
                // NFT images come from arbitrary, unpredictable third-party
                // hosts per collection; next/image requires a static
                // remote-domain allowlist that can't cover them.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={nft.image}
                  alt={nft.name}
                  width={150}
                  height={150}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <></>
              )}
              <span className="absolute bottom-2 left-2 rounded-md p-1 text-xs">
                #{truncateStr(nft.tokenId)}
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
