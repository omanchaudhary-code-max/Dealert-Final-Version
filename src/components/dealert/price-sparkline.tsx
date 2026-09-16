"use client";

import { useMemo } from "react";

interface PriceSparklineProps {
  data: number[];
  className?: string;
}

export function PriceSparkline({ data, className = "h-10" }: PriceSparklineProps) {
  const { pointsString, colorClass } = useMemo(() => {
    if (!data || data.length === 0) return { pointsString: "", colorClass: "stroke-primary" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 40 - ((val - min) / range) * 32;
      return `${x},${y}`;
    }).join(" ");

    const isDropped = data[data.length - 1] < data[0];
    const colorClass = isDropped ? "stroke-success" : "stroke-destructive";

    return { pointsString: points, colorClass };
  }, [data]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg viewBox="0 0 120 45" className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsString}
          className={colorClass}
        />
      </svg>
    </div>
  );
}
