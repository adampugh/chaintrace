"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
const data = [
  {
    name: "DeFi tokens",
    value: 38,
    color: "#7857FF",
  },
  {
    name: "Stablecoins",
    value: 25,
    color: "#28C6E8",
  },
  {
    name: "NFTs",
    value: 21,
    color: "#474E70",
  },
  {
    name: "Other",
    value: 16,
    color: "#232A42",
  },
];

export default function PortfolioCompositionChart() {
  return (
    <div className="border-line text-align w-fill bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary mb-8 text-left font-mono text-sm uppercase">
        Portfolio Composition Chart
      </h2>
      <div className="flex gap-4">
        <div className="h-36 w-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={0}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                />

                <span className="text-text-secondary">{item.name}</span>
              </div>

              <span className="font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
