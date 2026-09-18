"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const INDEX_PREVIEW_DATA = [
  { month: "Jan", index: 100 },
  { month: "Feb", index: 102.5 },
  { month: "Mar", index: 104.2 },
  { month: "Apr", index: 103.8 },
  { month: "May", index: 105.1 },
  { month: "Jun", index: 103.9 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl border border-primary/40 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-md transition-all duration-200 ease-out animate-in fade-in-50 zoom-in-95 pointer-events-none">
      <p className="font-mono-num text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
      <p className="font-display font-mono-num text-xs font-bold text-primary mt-0.5">
        Price Index: {val}
      </p>
    </div>
  );
}

export default function DealertChart() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  return (
    <div className="w-full h-60 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
            content={<CustomTooltip />}
            cursor={{ stroke: "#3b82f6", strokeWidth: 1.5, strokeDasharray: "3 3", opacity: 0.6 }}
            wrapperStyle={{ outline: "none", zIndex: 30 }}
            animationDuration={reducedMotion ? 0 : 200}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="index"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIndex)"
            isAnimationActive={!reducedMotion}
            animationDuration={400}
            animationEasing="ease-out"
            activeDot={{
              r: 6,
              fill: "#3b82f6",
              stroke: "#ffffff",
              strokeWidth: 2,
              className: "transition-all duration-150 ease-out",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}