"use client";

import { useEffect, useState, useRef, MouseEvent } from "react";
import { formatCurrency } from "@/lib/format";
import { Sparkles } from "lucide-react";

interface SnapshotHistoryPoint {
  month: string;
  avgPriceOverall: number;
  index: number;
  categoriesCount: number;
  computedAt?: string;
}

interface IndexChartProps {
  onSelectMonth?: (month: string) => void;
}

export function IndexChart({ onSelectMonth }: IndexChartProps) {
  const [data, setData] = useState<SnapshotHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/price-index?history=true")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.snapshots) && resData.snapshots.length > 0) {
          const firstPrice = resData.snapshots[0].avgPriceOverall || 1;
          const points: SnapshotHistoryPoint[] = resData.snapshots.map(
            (s: { month: string; avgPriceOverall: number; categoriesCount?: number; computedAt?: string }) => ({
              month: s.month,
              avgPriceOverall: s.avgPriceOverall,
              index: Number(((s.avgPriceOverall / firstPrice) * 100).toFixed(1)),
              categoriesCount: s.categoriesCount || 0,
              computedAt: s.computedAt,
            })
          );
          setData(points);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch price index history:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-60 w-full flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-2xl animate-pulse">
        Loading historical index data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-60 w-full flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/60">
        No historical price index snapshots recorded yet.
      </div>
    );
  }

  if (data.length === 1) {
    const single = data[0];
    return (
      <div className="h-60 w-full flex flex-col items-center justify-center space-y-2 bg-muted/20 rounded-2xl border border-border/60 p-4 text-center">
        <span className="font-mono-num text-xs uppercase tracking-wider text-muted-foreground">
          Single Month Snapshot Recorded ({single.month})
        </span>
        <span className="font-display text-3xl font-bold text-primary">
          Index 100.0 ({formatCurrency(single.avgPriceOverall)})
        </span>
        <span className="text-xs text-muted-foreground">
          {single.categoriesCount} categories tracked · Additional monthly snapshots will plot interactive trend lines automatically.
        </span>
      </div>
    );
  }

  const values = data.map((d) => d.index);
  const minV = Math.min(...values) - 0.5;
  const maxV = Math.max(...values) + 0.5;
  const range = maxV - minV || 1;

  const points = data.map((pt, i) => {
    const x = (i / (data.length - 1)) * 600;
    const y = 160 - ((pt.index - minV) / range) * 120;
    return { x, y, pt, i };
  });

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPoints = `0,200 ${pointsString} 600,200`;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, mouseX / rect.width));
    const closestIdx = Math.round(pct * (points.length - 1));
    setHoveredIndex(closestIdx);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full space-y-3">
      {/* Top Hover Info Bar */}
      <div className="flex items-center justify-between min-h-7 rounded-xl bg-muted/30 px-3 py-1 text-xs border border-border/40">
        {activePoint ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 font-mono-num animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                {activePoint.pt.month}
              </span>
              <span className="text-muted-foreground">Avg Price:</span>
              <span className="font-bold text-foreground">
                {formatCurrency(activePoint.pt.avgPriceOverall)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Index:</span>
              <span className="font-bold text-primary">{activePoint.pt.index}</span>
              <span className="text-[11px] text-muted-foreground">
                ({activePoint.pt.categoriesCount} categories)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs italic w-full justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Hover or tap over the graph line to inspect database price points per month</span>
          </div>
        )}
      </div>

      {/* Interactive SVG Chart Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => {
          if (activePoint && onSelectMonth) {
            onSelectMonth(activePoint.pt.month);
          }
        }}
        className="relative h-48 w-full cursor-crosshair touch-none select-none"
      >
        <svg viewBox="0 0 600 200" className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Reference Grid lines */}
          <line x1="0" y1="40" x2="600" y2="40" stroke="var(--border)" strokeOpacity="0.25" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="var(--border)" strokeOpacity="0.25" strokeDasharray="4 4" />
          <line x1="0" y1="160" x2="600" y2="160" stroke="var(--border)" strokeOpacity="0.25" strokeDasharray="4 4" />

          {/* Fill Area */}
          <polygon points={fillPoints} fill="url(#indexGradient)" />

          {/* Line Path */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Static Point Markers */}
          {points.map((p) => (
            <circle
              key={p.pt.month}
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-background stroke-primary stroke-2"
            />
          ))}

          {/* Hover Guide Line & Active Pulse Point */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1="0"
                x2={activePoint.x}
                y2="200"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="var(--background)"
                stroke="#3b82f6"
                strokeWidth="3"
                className="animate-pulse"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3"
                fill="#3b82f6"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-primary/40 bg-card/95 p-2.5 shadow-elevated backdrop-blur-md transition-all duration-75 min-w-[140px]"
            style={{
              left: `${(activePoint.x / 600) * 100}%`,
              top: `${Math.max(15, (activePoint.y / 200) * 100 - 8)}%`,
            }}
          >
            <p className="font-mono-num text-[10px] uppercase font-bold text-primary">
              Month: {activePoint.pt.month}
            </p>
            <p className="font-display font-mono-num text-sm font-extrabold text-foreground mt-0.5">
              {formatCurrency(activePoint.pt.avgPriceOverall)}
            </p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 border-t border-border/40 pt-1">
              <span>Index {activePoint.pt.index}</span>
              <span>{activePoint.pt.categoriesCount} cats</span>
            </div>
          </div>
        )}
      </div>

      {/* Month Labels below SVG */}
      <div className="flex justify-between font-mono-num text-xs text-muted-foreground pt-1">
        {data.map((d, i) => (
          <button
            key={d.month}
            onClick={() => onSelectMonth && onSelectMonth(d.month)}
            className={`transition-colors hover:text-primary cursor-pointer ${
              hoveredIndex === i ? "text-primary font-bold underline" : ""
            }`}
          >
            {d.month}
          </button>
        ))}
      </div>
    </div>
  );
}
