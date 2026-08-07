"use client";
import NoData from "./NoData";

import {
  Area,
  XAxis,
  YAxis,
  AreaChart,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "JAN", value: 42 },
  { month: "FEB", value: 38 },
  { month: "MAR", value: 51 },
  { month: "APR", value: 47 },
  { month: "MAY", value: 63 },
  { month: "JUN", value: 58 },
  { month: "JUL", value: 71 },
  { month: "AUG", value: 66 },
  { month: "SEP", value: 75 },
  { month: "OCT", value: 82 },
  { month: "NOV", value: 77 },
  { month: "DEC", value: 91 },
];

export default function OverTimeChart() {
  return (
    <div className="border-line text-align w-fill bg-surface flex h-70 flex-1 flex-col rounded-xl border p-6">
      <div className="flex place-content-between">
        <h2 className="text-text-secondary mb-6 text-left font-mono text-sm uppercase">
          Portfolio value over time
        </h2>
        <p className="text-text-secondary text-sm uppercase">1Y</p>
      </div>
      {data?.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="portfolioGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#6D5EF9" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6D5EF9" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis hide />
            <YAxis hide />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4F8DFF"
              strokeWidth={3}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </div>
  );
}
