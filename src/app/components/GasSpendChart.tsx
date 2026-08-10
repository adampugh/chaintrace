"use client";
import NoData from "./NoData";
import { currencyFormatter } from "../lib/format";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

function isTrendingUp(data: { month: string; gas: number }[]): boolean {
  if (data.length < 2) return false;

  const midpoint = Math.floor(data.length / 2);
  const average = (points: { gas: number }[]) =>
    points.reduce((sum, p) => sum + p.gas, 0) / points.length;

  return average(data.slice(midpoint)) > average(data.slice(0, midpoint));
}

export default function GasSpendChart({
  data,
}: {
  data: { month: string; gas: number }[];
}) {
  const total = data.reduce((sum, p) => sum + p.gas, 0);
  const trendLabel = isTrendingUp(data) ? "Trending up" : "Trending down";

  return (
    <div className="border-line text-align w-fill bg-surface flex flex-col rounded-xl border p-8">
      <h2 className="text-text-secondary font-mono text-sm uppercase">
        Gas Spend, Last 6 Months
      </h2>
      {data?.length ? (
        <>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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

            <p className="font-mono text-sm">
              {trendLabel} · {currencyFormatter.format(total)} total, 6mo
            </p>
          </div>
        </>
      ) : (
        <NoData />
      )}
    </div>
  );
}
