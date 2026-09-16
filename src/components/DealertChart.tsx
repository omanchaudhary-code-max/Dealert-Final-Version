"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const INDEX_PREVIEW_DATA = [
  { month: "Jan", index: 100 },
  { month: "Feb", index: 102.5 },
  { month: "Mar", index: 104.2 },
  { month: "Apr", index: 103.8 },
  { month: "May", index: 105.1 },
  { month: "Jun", index: 103.9 },
];

export default function DealertChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={INDEX_PREVIEW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
        <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={["dataMin - 2", "auto"]} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "var(--foreground)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Area
          type="monotone"
          dataKey="index"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorIndex)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}