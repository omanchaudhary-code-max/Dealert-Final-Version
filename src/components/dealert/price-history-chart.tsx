"use client";

import { useState, useMemo, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import { formatCurrency } from "@/lib/format";

interface PriceHistoryChartProps {
  data?: { date: string; price: number }[];
  height?: number;
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  const chartPoints = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 30 }).map((_, i) => ({
        date: `Day ${i + 1}`,
        price: 42999 - Math.sin(i / 4) * 1800 - i * 120 + (i > 22 ? 1500 : 0),
      }));
    }
    return data;
  }, [data]);

  const prices = chartPoints.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const points = useMemo(() => {
    return chartPoints.map((pt, i) => {
      const x = (i / (chartPoints.length - 1)) * 500;
      const y = 140 - ((pt.price - minPrice) / range) * 100;
      return { x, y, pt, i };
    });
  }, [chartPoints, minPrice, range]);

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const fillString = `0,150 ${pointsString} 500,150`;

  const calculateClosestIndex = (clientX: number) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, mouseX / rect.width));
    const closestIdx = Math.round(pct * (points.length - 1));
    setHoveredIndex(closestIdx);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    calculateClosestIndex(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches.length > 0) {
      calculateClosestIndex(e.touches[0].clientX);
    }
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-card border border-border/60 p-4 shadow-card space-y-2">
      {/* Top Hover Info Bar */}
      <div className="flex items-center justify-between h-6 font-mono-num text-xs">
        {activePoint ? (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <span className="font-semibold text-muted-foreground">{activePoint.pt.date}:</span>
            <span className="font-bold text-primary text-sm">
              {formatCurrency(activePoint.pt.price)}
            </span>
          </div>
        ) : (
          <div className="text-muted-foreground transition-opacity">
            💡 Hover or tap on the graph line to inspect exact prices
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setHoveredIndex(null)}
        className="relative h-44 w-full cursor-crosshair touch-none select-none"
      >
        <svg viewBox="0 0 500 150" className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />

          {/* Area Fill */}
          <polygon points={fillString} fill="url(#priceGradient)" className={reducedMotion ? "" : "transition-all duration-300 ease-out"} />

          {/* Line Path */}
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
            className={reducedMotion ? "" : "transition-all duration-300 ease-out"}
          />

          {/* Hover indicator line & dot */}
          {activePoint && (
            <g className={reducedMotion ? "" : "transition-all duration-150 ease-out"}>
              <line
                x1={activePoint.x}
                y1="0"
                x2={activePoint.x}
                y2="150"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
                className={reducedMotion ? "" : "transition-all duration-150 ease-out"}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth="3"
                className={reducedMotion ? "" : "animate-pulse transition-all duration-150 ease-out"}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3"
                fill="var(--primary)"
                className={reducedMotion ? "" : "transition-all duration-150 ease-out"}
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Popup Box */}
        {activePoint && (
          <div
            className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-primary/40 bg-card/95 px-3 py-1.5 shadow-elevated backdrop-blur-md ${
              reducedMotion ? "" : "transition-all duration-200 ease-out animate-in fade-in-50 zoom-in-95"
            }`}
            style={{
              left: `${(activePoint.x / 500) * 100}%`,
              top: `${Math.max(18, (activePoint.y / 150) * 100 - 8)}%`,
            }}
          >
            <p className="font-mono-num text-[10px] text-muted-foreground leading-none">
              {activePoint.pt.date}
            </p>
            <p className="font-display font-mono-num text-xs font-bold text-primary mt-0.5 whitespace-nowrap">
              {formatCurrency(activePoint.pt.price)}
            </p>
          </div>
        )}
      </div>

      {/* Footer Dates */}
      <div className="flex justify-between font-mono-num text-[10px] text-muted-foreground pt-1">
        <span>{chartPoints[0]?.date || "Start"}</span>
        <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.date || "Mid"}</span>
        <span>{chartPoints[chartPoints.length - 1]?.date || "Latest"}</span>
      </div>
    </div>
  );
}
