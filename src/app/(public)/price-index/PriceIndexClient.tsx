"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Flame,
  BarChart3,
  Lock,
  Download,
  Database,
  FileSpreadsheet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import { StatCard } from "@/components/dealert/stat-card";
import { IndexChart } from "@/components/dealert/index-chart";
import { PriceSparkline } from "@/components/dealert/price-sparkline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CategoryItem {
  category: string;
  avgPrice: number;
  productCount: number;
  pctChangeVsLastMonth: number | null;
}

interface PriceIndexResponse {
  month: string;
  methodologyVersion: string;
  computedAt: string;
  topMovers: CategoryItem[];
  categories: CategoryItem[];
}

interface CategorySnapshotDoc {
  month: string;
  categories?: CategoryItem[];
}

export function PriceIndexClient() {
  const { user } = useAuth();
  const isPro = user?.role === "pro" || user?.role === "admin";
  const [snapshot, setSnapshot] = useState<PriceIndexResponse | null>(null);
  const [historySnapshots, setHistorySnapshots] = useState<CategorySnapshotDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthSnapshot = (monthStr: string) => {
    setLoading(true);
    fetch(`/api/price-index?month=${monthStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.month) {
          setSnapshot(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch price index snapshot:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/price-index").then((res) => res.json()),
      fetch("/api/price-index?history=true").then((res) => res.json()),
    ])
      .then(([latestData, historyData]) => {
        if (latestData && latestData.month) {
          setSnapshot(latestData);
        }
        if (historyData && Array.isArray(historyData.snapshots)) {
          setHistorySnapshots(historyData.snapshots);
        }
      })
      .catch((err) => console.warn("Failed to fetch price index data:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = snapshot?.categories || [];
  const topMovers = snapshot?.topMovers || [];
  const monthLabel = snapshot?.month || "2026-07";
  const versionLabel = snapshot?.methodologyVersion || "v1";

  const availableMonths = historySnapshots.map((s) => s.month);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 bg-grid opacity-[0.18]" aria-hidden />
        <div className="relative mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono-num text-[11px] uppercase tracking-wider text-muted-foreground glass">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Macro Economic E-Commerce Index — Nepal (NEPI)
              </span>

              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
                Nepal E-Commerce <span className="gradient-text">Price Index</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Aggregated monthly category price trends, market inflation rates, and price volatility analytics tracked across Nepalese online merchants.
              </p>
            </div>

            {/* Selector and Version Info */}
            <div className="flex flex-wrap items-center gap-3">
              {availableMonths.length > 0 && (
                <div className="flex items-center gap-2 bg-card border border-border/60 p-1.5 rounded-2xl shadow-xs">
                  <span className="font-mono text-xs text-muted-foreground pl-2">Select Month:</span>
                  <select
                    value={monthLabel}
                    onChange={(e) => fetchMonthSnapshot(e.target.value)}
                    className="bg-transparent text-xs font-bold font-mono text-foreground pr-2 outline-none cursor-pointer"
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m} className="bg-card text-foreground">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-2xl border border-border/60 bg-card px-4 py-2 text-xs font-mono backdrop-blur">
                <span className="text-muted-foreground">Snapshot: </span>
                <span className="font-bold text-foreground">{monthLabel}</span>
                <span className="text-muted-foreground ml-2">Version: </span>
                <span className="font-bold text-primary">{versionLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 space-y-8">
        {/* Top Movers Bar */}
        {topMovers.length > 0 && (
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <span>Top Category Price Movers ({monthLabel})</span>
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground">
                Filtered by MIN_PRODUCTS_PER_CATEGORY (≥5 products)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topMovers.map((item) => {
                const isDown = item.pctChangeVsLastMonth !== null && item.pctChangeVsLastMonth < 0;
                const isUp = item.pctChangeVsLastMonth !== null && item.pctChangeVsLastMonth > 0;

                return (
                  <div
                    key={item.category}
                    className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-foreground block">{item.category}</span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        Rs {item.avgPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      {item.pctChangeVsLastMonth !== null ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-mono-num font-bold text-xs px-2 py-0.5 rounded-full border",
                            isDown
                              ? "bg-success/15 text-success border-success/30"
                              : isUp
                              ? "bg-destructive/15 text-destructive border-destructive/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {isDown ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : isUp ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {Math.abs(item.pctChangeVsLastMonth)}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">Baseline</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Index Chart Overview */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Historical Category Trend Line</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Normalized index trajectory across monthly snapshots in MongoDB
              </p>
            </div>
          </div>

          <IndexChart snapshots={historySnapshots} height={260} />
        </div>

        {/* All Category Breakdown Table */}
        <div className="rounded-3xl border border-border/60 bg-card shadow-card overflow-hidden">
          <div className="p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Category Basket Summary ({categories.length} Categories)
              </h2>
              <p className="text-xs text-muted-foreground">
                Snapshot computation rules: mean average price per category, excluding delisted items.
              </p>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              {isPro ? (
                <>
                  <a href={`/api/price-index/export?month=${monthLabel}&format=csv`} download>
                    <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 rounded-xl cursor-pointer">
                      <Download className="h-3.5 w-3.5 text-primary" />
                      <span>Export CSV</span>
                    </Button>
                  </a>
                  <a href={`/api/price-index/export?month=${monthLabel}&format=json`} download>
                    <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 rounded-xl cursor-pointer">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                      <span>Export JSON</span>
                    </Button>
                  </a>
                </>
              ) : (
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 rounded-xl text-muted-foreground hover:text-foreground">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Unlock CSV/JSON Export (Pro)</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              Loading price index snapshot data...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <Info className="h-6 w-6 mx-auto text-primary" />
              <p className="font-bold text-foreground">No Snapshot Data Stored for {monthLabel}</p>
              <p className="max-w-md mx-auto">
                No categories met the minimum threshold of 5 products for this month. Run the crawler or select a different month.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Stacked Card View (< 768px) */}
              <div className="block md:hidden p-4 space-y-3">
                {categories.map((cat) => {
                  const isDown = cat.pctChangeVsLastMonth !== null && cat.pctChangeVsLastMonth < 0;
                  const isUp = cat.pctChangeVsLastMonth !== null && cat.pctChangeVsLastMonth > 0;

                  return (
                    <div key={cat.category} className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/deals?search=${encodeURIComponent(cat.category)}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                            {cat.category}
                          </Link>
                          <span className="text-[10px] font-mono text-muted-foreground">{cat.productCount} qualifying items</span>
                        </div>

                        {cat.pctChangeVsLastMonth !== null ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-mono-num font-bold text-xs px-2 py-0.5 rounded-full border shrink-0",
                              isDown
                                ? "bg-success/15 text-success border-success/30"
                                : isUp
                                ? "bg-destructive/15 text-destructive border-destructive/30"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {isDown ? <ArrowDownRight className="h-3 w-3" /> : isUp ? <ArrowUpRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {Math.abs(cat.pctChangeVsLastMonth)}%
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">Baseline</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 font-mono">
                        <span className="text-muted-foreground">Average Price:</span>
                        <span className="font-bold text-foreground font-mono-num">Rs {cat.avgPrice.toLocaleString()}</span>
                      </div>

                      <div className="pt-1">
                        <CategorySparkline history={historySnapshots} categoryName={cat.category} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 font-mono uppercase text-[10px] text-muted-foreground">
                      <th className="py-3 px-6 font-semibold">Category Name</th>
                      <th className="py-3 px-4 font-semibold text-right">Average Price (NPR)</th>
                      <th className="py-3 px-4 font-semibold text-right">Qualifying Products</th>
                      <th className="py-3 px-4 font-semibold text-right">MoM % Change</th>
                      <th className="py-3 px-6 font-semibold text-center w-48">Historical Sparkline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {categories.map((cat) => {
                      const isDown = cat.pctChangeVsLastMonth !== null && cat.pctChangeVsLastMonth < 0;
                      const isUp = cat.pctChangeVsLastMonth !== null && cat.pctChangeVsLastMonth > 0;

                      return (
                        <tr key={cat.category} className="hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-6 font-bold text-foreground">
                            <Link href={`/deals?search=${encodeURIComponent(cat.category)}`} className="hover:text-primary transition-colors">
                              {cat.category}
                            </Link>
                          </td>
                          <td className="py-4 px-4 font-mono-num font-semibold text-right text-foreground">
                            Rs {cat.avgPrice.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-mono-num text-right text-muted-foreground">
                            {cat.productCount} items
                          </td>
                          <td className="py-4 px-4 text-right">
                            {cat.pctChangeVsLastMonth !== null ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 font-mono-num font-bold text-xs px-2 py-0.5 rounded-full border",
                                  isDown
                                    ? "bg-success/15 text-success border-success/30"
                                    : isUp
                                    ? "bg-destructive/15 text-destructive border-destructive/30"
                                    : "bg-muted text-muted-foreground border-border"
                                )}
                              >
                                {isDown ? (
                                  <ArrowDownRight className="h-3 w-3" />
                                ) : isUp ? (
                                  <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                                {Math.abs(cat.pctChangeVsLastMonth)}%
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="py-2 px-6">
                            <CategorySparkline history={historySnapshots} categoryName={cat.category} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function CategorySparkline({
  history,
  categoryName,
}: {
  history: CategorySnapshotDoc[];
  categoryName: string;
}) {
  const prices = (history || [])
    .map((s) => {
      const target = categoryName.toLowerCase().trim();
      const found = s.categories?.find(
        (c) => c.category.toLowerCase().trim() === target
      );
      return found ? found.avgPrice : null;
    })
    .filter((val): val is number => val !== null);

  if (prices.length < 2) {
    return (
      <div className="h-12 w-full flex items-center justify-center text-[11px] text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/40 font-mono">
        Not enough history yet ({prices.length} month)
      </div>
    );
  }

  return <PriceSparkline data={prices} className="h-12" />;
}
