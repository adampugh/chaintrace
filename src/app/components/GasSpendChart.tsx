"use client";
import NoData from "./NoData";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

const gasSpendData = [
  { month: "Mar", gas: 120 },
  { month: "Apr", gas: 180 },
  { month: "May", gas: 140 },
  { month: "Jun", gas: 260 },
  { month: "Jul", gas: 210 },
  { month: "Aug", gas: 330 },
];

export default function GasSpendChart() {
  return (
    <div className="border-line text-align w-fill bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary font-mono text-sm uppercase">
        Gas Spend, Last 6 Months
      </h2>
      {gasSpendData?.length ? (
        <>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gasSpendData}>
                <defs>
                  <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C4DFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#7C4DFF" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  padding={{
                    left: 10,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="gas"
                  stroke="#7C4DFF"
                  strokeWidth={2}
                  fill="url(#gasGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex items-center rounded-xl bg-white/5 px-4 py-3">
            <div className="mr-4 h-12 w-1 rounded-full bg-[#7C4DFF]" />

            <p className="font-mono text-sm">Trending up · $1,240 total, 6mo</p>
          </div>
        </>
      ) : (
        <NoData />
      )}
    </div>
  );
}
