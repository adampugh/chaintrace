"use client";
import NoData from "./NoData";
import { currencyFormatter } from "../lib/format";

import {
  Area,
  XAxis,
  YAxis,
  AreaChart,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { month: string; value: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="bg-surface border-line rounded-lg border px-3 py-2 shadow-lg">
      <p className="text-text-secondary font-mono text-xs uppercase">
        {point.month}
      </p>
      <p className="text-text font-mono text-sm">
        {currencyFormatter.format(point.value)}
      </p>
    </div>
  );
}

export default function OverTimeChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const values = data.map((d) => d.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const padding = (max - min) * 0.1 || max * 0.05 || 1;
  const yDomain: [number, number] = [min - padding, max + padding];

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

            <XAxis hide dataKey="month" />
            <YAxis hide domain={yDomain} />
            <Tooltip content={<ChartTooltip />} />

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
