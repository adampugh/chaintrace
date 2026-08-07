import NoData from "./NoData";

const protocols = [
  {
    name: "Uniswap",
    interactions: 142,
  },
  {
    name: "Aave",
    interactions: 88,
  },
  {
    name: "Blur",
    interactions: 51,
  },
  {
    name: "Lido",
    interactions: 27,
  },
];

export default function TopProtocolsChart() {
  const maxInteractions = Math.max(...protocols.map((p) => p.interactions));
  return (
    <div className="border-line text-align w-fill font-display bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary mb-8 text-left font-mono text-sm uppercase">
        Top Protocols Chart
      </h2>
      {protocols?.length ? (
        <div className="space-y-2">
          {protocols.map((protocol, index) => (
            <div key={protocol.name}>
              <div className="flex items-center gap-4">
                <span className="text-text-secondary w-6 font-mono text-xs">
                  {(index + 1).toString().padStart(2, "0")}
                </span>

                <span className="flex-1 text-left font-medium">
                  {protocol.name}
                </span>

                <div className="w-32">
                  <div className="h-1 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                      style={{
                        width: `${
                          (protocol.interactions / maxInteractions) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <span className="w-10 text-right font-semibold">
                  {protocol.interactions}
                </span>
              </div>

              {index < protocols.length - 1 && (
                <div className="border-line mt-4 border-b" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
}
