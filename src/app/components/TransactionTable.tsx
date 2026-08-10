import NoData from "./NoData";

export type Transaction = {
  id: string;
  type: "Swap" | "Transfer" | "Approve";
  protocol: string | null;
  amount: string;
  timestamp: string;
};

const badgeColours = {
  Swap: "bg-violet-500/15 text-violet-400",
  Transfer: "bg-emerald-500/15 text-emerald-400",
  Approve: "bg-red-500/15 text-red-400",
};

export default function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="border-line text-align w-fill bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary mb-8 text-left font-mono text-sm uppercase">
        Transaction Table
      </h2>
      {transactions?.length ? (
        <table className="w-full">
          <thead className="text-text-secondary border-line border-b text-xs tracking-wider uppercase">
            <tr>
              <th className="pb-4 text-left font-normal">Type</th>
              <th className="pb-4 text-left font-normal">Protocol</th>
              <th className="pb-4 text-left font-normal">Amount</th>
              <th className="pb-4 text-left font-normal">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-line border-b last:border-0">
                <td className="py-4 text-left">
                  <span
                    className={`font-display rounded-md px-2 py-1 text-xs ${
                      badgeColours[tx.type]
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="text-text text-left">{tx.protocol ?? "—"}</td>
                <td className="text-left font-mono">{tx.amount}</td>
                <td className="text-text-secondary text-left">
                  {tx.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <NoData />
      )}
    </div>
  );
}
